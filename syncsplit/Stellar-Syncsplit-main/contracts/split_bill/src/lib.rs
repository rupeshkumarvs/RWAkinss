#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
    Vec, log,
};

// ─── Data Types ───────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Participant {
    pub address: Address,
    pub amount: i128,
    pub paid: bool,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Split {
    pub id: u64,
    pub creator: Address,
    pub total_amount: i128,
    pub description: String,
    pub participants: Vec<Participant>,
    pub created_at: u64,
    pub settled: bool,
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Split(u64),
    SplitCounter,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct SplitBillContract;

#[contractimpl]
impl SplitBillContract {
    /// Create a new split bill.
    ///
    /// # Arguments
    /// * `creator` - The address of the split creator (requires auth)
    /// * `total_amount` - Total amount in stroops (1 XLM = 10_000_000 stroops)
    /// * `description` - Human-readable description of the split
    ///
    /// # Returns
    /// The split ID (u64)
    pub fn create_split(
        env: Env,
        creator: Address,
        total_amount: i128,
        description: String,
    ) -> u64 {
        // Require the creator to authorize this call
        creator.require_auth();

        // Validate total amount is positive
        if total_amount <= 0 {
            panic!("Total amount must be positive");
        }

        // Get and increment the split counter
        let split_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::SplitCounter)
            .unwrap_or(0);
        let new_id = split_id + 1;
        env.storage()
            .instance()
            .set(&DataKey::SplitCounter, &new_id);

        // Create the split
        let split = Split {
            id: new_id,
            creator: creator.clone(),
            total_amount,
            description: description.clone(),
            participants: Vec::new(&env),
            created_at: env.ledger().timestamp(),
            settled: false,
        };

        // Store the split in persistent storage
        env.storage()
            .persistent()
            .set(&DataKey::Split(new_id), &split);

        // Emit SplitCreated event
        env.events().publish(
            (symbol_short!("SPLIT"), symbol_short!("created")),
            (new_id, creator, total_amount),
        );

        log!(&env, "Split created: id={}, amount={}", new_id, total_amount);

        new_id
    }

    /// Add a participant to an existing split.
    ///
    /// # Arguments
    /// * `split_id` - The split to add to
    /// * `address` - The participant's Stellar address
    /// * `amount` - The amount this participant owes (in stroops)
    pub fn add_participant(env: Env, split_id: u64, address: Address, amount: i128) {
        // Load the split
        let mut split: Split = env
            .storage()
            .persistent()
            .get(&DataKey::Split(split_id))
            .expect("Split not found");

        // Only the creator can add participants
        split.creator.require_auth();

        // Validate amount
        if amount <= 0 {
            panic!("Participant amount must be positive");
        }

        // Prevent duplicate participants
        for p in split.participants.iter() {
            if p.address == address {
                panic!("Participant already exists in this split");
            }
        }

        // Calculate current total of all participant amounts
        let mut current_total: i128 = 0;
        for p in split.participants.iter() {
            current_total += p.amount;
        }

        // Ensure adding this participant doesn't exceed total
        if current_total + amount > split.total_amount {
            panic!("Adding this participant would exceed the total split amount");
        }

        // Add the participant
        let participant = Participant {
            address: address.clone(),
            amount,
            paid: false,
        };
        split.participants.push_back(participant);

        // Save updated split
        env.storage()
            .persistent()
            .set(&DataKey::Split(split_id), &split);

        // Emit ParticipantAdded event
        env.events().publish(
            (symbol_short!("SPLIT"), symbol_short!("p_added")),
            (split_id, address, amount),
        );

        log!(&env, "Participant added to split {}", split_id);
    }

    /// Mark a participant as having paid their share.
    ///
    /// # Arguments
    /// * `split_id` - The split ID
    /// * `address` - The address of the participant marking as paid (requires auth)
    pub fn mark_paid(env: Env, split_id: u64, address: Address) {
        // The participant must authorize marking themselves as paid
        address.require_auth();

        // Load the split
        let mut split: Split = env
            .storage()
            .persistent()
            .get(&DataKey::Split(split_id))
            .expect("Split not found");

        // Find and update the participant
        let mut found = false;
        let mut updated_participants = Vec::new(&env);
        let mut all_paid = true;

        for p in split.participants.iter() {
            if p.address == address {
                if p.paid {
                    panic!("Participant has already paid");
                }
                updated_participants.push_back(Participant {
                    address: p.address.clone(),
                    amount: p.amount,
                    paid: true,
                });
                found = true;
            } else {
                if !p.paid {
                    all_paid = false;
                }
                updated_participants.push_back(p.clone());
            }
        }

        if !found {
            panic!("Participant not found in this split");
        }

        split.participants = updated_participants;

        // Check if all participants have paid — if so, mark split as settled
        if all_paid && found {
            split.settled = true;
        }

        // Save updated split
        env.storage()
            .persistent()
            .set(&DataKey::Split(split_id), &split);

        // Emit PaymentMarked event
        env.events().publish(
            (symbol_short!("SPLIT"), symbol_short!("paid")),
            (split_id, address),
        );

        log!(&env, "Payment marked for split {}", split_id);
    }

    /// Get the full details of a split.
    ///
    /// # Arguments
    /// * `split_id` - The split ID to query
    ///
    /// # Returns
    /// The full Split struct
    pub fn get_split(env: Env, split_id: u64) -> Split {
        env.storage()
            .persistent()
            .get(&DataKey::Split(split_id))
            .expect("Split not found")
    }

    /// Get the current split counter (total number of splits created).
    pub fn get_split_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::SplitCounter)
            .unwrap_or(0)
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_create_split() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let description = String::from_str(&env, "Dinner split");

        // 100 XLM in stroops
        let total_amount: i128 = 1_000_000_000;

        let split_id = client.create_split(&creator, &total_amount, &description);
        assert_eq!(split_id, 1);

        let split = client.get_split(&split_id);
        assert_eq!(split.creator, creator);
        assert_eq!(split.total_amount, total_amount);
        assert_eq!(split.participants.len(), 0);
        assert_eq!(split.settled, false);
    }

    #[test]
    fn test_add_participant() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let participant = Address::generate(&env);
        let description = String::from_str(&env, "Dinner split");

        let total_amount: i128 = 1_000_000_000; // 100 XLM
        let split_id = client.create_split(&creator, &total_amount, &description);

        client.add_participant(&split_id, &participant, &500_000_000);

        let split = client.get_split(&split_id);
        assert_eq!(split.participants.len(), 1);
        assert_eq!(split.participants.get(0).unwrap().amount, 500_000_000);
        assert_eq!(split.participants.get(0).unwrap().paid, false);
    }

    #[test]
    fn test_mark_paid() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let participant = Address::generate(&env);
        let description = String::from_str(&env, "Coffee run");

        let total_amount: i128 = 500_000_000; // 50 XLM
        let split_id = client.create_split(&creator, &total_amount, &description);

        client.add_participant(&split_id, &participant, &500_000_000);
        client.mark_paid(&split_id, &participant);

        let split = client.get_split(&split_id);
        assert_eq!(split.participants.get(0).unwrap().paid, true);
        assert_eq!(split.settled, true);
    }

    #[test]
    fn test_multiple_participants() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let p1 = Address::generate(&env);
        let p2 = Address::generate(&env);
        let p3 = Address::generate(&env);
        let description = String::from_str(&env, "Group dinner");

        let total_amount: i128 = 900_000_000; // 90 XLM
        let split_id = client.create_split(&creator, &total_amount, &description);

        client.add_participant(&split_id, &p1, &300_000_000);
        client.add_participant(&split_id, &p2, &300_000_000);
        client.add_participant(&split_id, &p3, &300_000_000);

        let split = client.get_split(&split_id);
        assert_eq!(split.participants.len(), 3);
        assert_eq!(split.settled, false);

        // p1 and p2 pay
        client.mark_paid(&split_id, &p1);
        client.mark_paid(&split_id, &p2);

        let split = client.get_split(&split_id);
        assert_eq!(split.settled, false); // p3 hasn't paid

        // p3 pays — split becomes settled
        client.mark_paid(&split_id, &p3);

        let split = client.get_split(&split_id);
        assert_eq!(split.settled, true);
    }

    #[test]
    #[should_panic(expected = "Participant already exists")]
    fn test_duplicate_participant() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let participant = Address::generate(&env);
        let description = String::from_str(&env, "Test");

        let split_id = client.create_split(&creator, &1_000_000_000, &description);
        client.add_participant(&split_id, &participant, &500_000_000);
        client.add_participant(&split_id, &participant, &500_000_000); // Should panic
    }

    #[test]
    fn test_split_counter() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SplitBillContract, ());
        let client = SplitBillContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let d1 = String::from_str(&env, "Split 1");
        let d2 = String::from_str(&env, "Split 2");

        assert_eq!(client.get_split_count(), 0);

        client.create_split(&creator, &1_000_000_000, &d1);
        assert_eq!(client.get_split_count(), 1);

        client.create_split(&creator, &2_000_000_000, &d2);
        assert_eq!(client.get_split_count(), 2);
    }
}
