export type ChartPoint = {
  date: string
  operations: number
  transactions: number
}

export type DashStats = {
  tools: number
  toolsSub: string
  chains: number
  chainsSub: string
  mockData: string
  mockDataSub: string
  uptime: string
  uptimeSub: string
}

export const DASH_STATS: DashStats = {
  tools: 8,
  toolsSub: '+2 this Q',
  chains: 4,
  chainsSub: 'Multi-chain',
  mockData: '0',
  mockDataSub: '100% live',
  uptime: '∞',
  uptimeSub: '30d streak',
}

/* 30-day daily activity */
export const ACTIVITY_30D: ChartPoint[] = [
  { date: 'Apr 20', operations: 1180, transactions: 820 },
  { date: 'Apr 21', operations: 1350, transactions: 895 },
  { date: 'Apr 22', operations: 1240, transactions: 830 },
  { date: 'Apr 23', operations: 1520, transactions: 980 },
  { date: 'Apr 24', operations: 1410, transactions: 910 },
  { date: 'Apr 25', operations: 1280, transactions: 860 },
  { date: 'Apr 26', operations: 1190, transactions: 790 },
  { date: 'Apr 27', operations: 1620, transactions: 1050 },
  { date: 'Apr 28', operations: 1480, transactions: 940 },
  { date: 'Apr 29', operations: 1360, transactions: 885 },
  { date: 'Apr 30', operations: 1290, transactions: 850 },
  { date: 'May 1',  operations: 1580, transactions: 1020 },
  { date: 'May 2',  operations: 1720, transactions: 1100 },
  { date: 'May 3',  operations: 1550, transactions: 995 },
  { date: 'May 4',  operations: 1420, transactions: 920 },
  { date: 'May 5',  operations: 1340, transactions: 875 },
  { date: 'May 6',  operations: 1260, transactions: 820 },
  { date: 'May 7',  operations: 1680, transactions: 1080 },
  { date: 'May 8',  operations: 1790, transactions: 1150 },
  { date: 'May 9',  operations: 1650, transactions: 1060 },
  { date: 'May 10', operations: 1520, transactions: 980 },
  { date: 'May 11', operations: 1450, transactions: 935 },
  { date: 'May 12', operations: 1380, transactions: 890 },
  { date: 'May 13', operations: 1760, transactions: 1130 },
  { date: 'May 14', operations: 1840, transactions: 1190 },
  { date: 'May 15', operations: 1710, transactions: 1100 },
  { date: 'May 16', operations: 1590, transactions: 1020 },
  { date: 'May 17', operations: 1480, transactions: 950 },
  { date: 'May 18', operations: 1620, transactions: 1045 },
  { date: 'May 19', operations: 1680, transactions: 1080 },
]

/* 7-day subset */
export const ACTIVITY_7D: ChartPoint[] = ACTIVITY_30D.slice(-7)

/* All-time (90 days, represented as monthly aggregates + recent) */
export const ACTIVITY_ALL: ChartPoint[] = [
  { date: 'Feb 19', operations: 880,  transactions: 600 },
  { date: 'Feb 26', operations: 940,  transactions: 640 },
  { date: 'Mar 5',  operations: 990,  transactions: 680 },
  { date: 'Mar 12', operations: 1050, transactions: 720 },
  { date: 'Mar 19', operations: 1090, transactions: 745 },
  { date: 'Mar 26', operations: 1140, transactions: 780 },
  { date: 'Apr 2',  operations: 1200, transactions: 820 },
  { date: 'Apr 9',  operations: 1320, transactions: 870 },
  { date: 'Apr 16', operations: 1280, transactions: 850 },
  { date: 'Apr 23', operations: 1450, transactions: 935 },
  { date: 'Apr 30', operations: 1290, transactions: 850 },
  { date: 'May 7',  operations: 1680, transactions: 1080 },
  { date: 'May 14', operations: 1840, transactions: 1190 },
  { date: 'May 19', operations: 1680, transactions: 1080 },
]

/* 1-day (24 hourly points) */
export const ACTIVITY_1D: ChartPoint[] = [
  { date: '00:00', operations: 38, transactions: 26 },
  { date: '01:00', operations: 32, transactions: 22 },
  { date: '02:00', operations: 28, transactions: 18 },
  { date: '03:00', operations: 24, transactions: 16 },
  { date: '04:00', operations: 26, transactions: 17 },
  { date: '05:00', operations: 34, transactions: 23 },
  { date: '06:00', operations: 48, transactions: 32 },
  { date: '07:00', operations: 58, transactions: 39 },
  { date: '08:00', operations: 65, transactions: 44 },
  { date: '09:00', operations: 72, transactions: 49 },
  { date: '10:00', operations: 69, transactions: 46 },
  { date: '11:00', operations: 74, transactions: 50 },
  { date: '12:00', operations: 68, transactions: 46 },
  { date: '13:00', operations: 71, transactions: 48 },
  { date: '14:00', operations: 76, transactions: 51 },
  { date: '15:00', operations: 80, transactions: 54 },
  { date: '16:00', operations: 75, transactions: 51 },
  { date: '17:00', operations: 66, transactions: 44 },
  { date: '18:00', operations: 59, transactions: 40 },
  { date: '19:00', operations: 54, transactions: 36 },
  { date: '20:00', operations: 50, transactions: 34 },
  { date: '21:00', operations: 47, transactions: 31 },
  { date: '22:00', operations: 43, transactions: 29 },
  { date: '23:00', operations: 39, transactions: 27 },
]
