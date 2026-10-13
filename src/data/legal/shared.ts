/* One place for the business facts and policy numbers used in all three documents */
export const legal = {
  brand: "The Hooker Lab",
  operator: "Kurt Eklund",
  operatorLine: "The Hooker Lab, operated by Kurt Eklund",
  website: "thehookerlab.co.nz",
  email: "admin@thehookerlab.co.nz",
  whatsapp: "+64 21 157 0941",
  country: "New Zealand",
  fileSlug: "the-hooker-lab",

  effectiveDate: "11 October 2026",
  lastUpdated: "11 October 2026",
  updatedISO: "2026-10-11",

  
  policy: {
    individualNoticeHours: 48,
    groupNoticeDays: 7,
    rescheduleWindowDays: 30,
    refundWorkingDays: 10,
    enquiryRetentionMonths: 24,
  },
} as const;