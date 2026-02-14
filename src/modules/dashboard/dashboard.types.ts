export type TUserActivity = {
  month: number;
  year: number;
  count: number;
};

export type TTopBrand = {
  _id: string;
  brandName: string;
  brandLogo: string | null;
  totalBags: number;
  bagCost: number;
  currentValue: number;
  percentageChange: number;
};

export type TDashboardData = {
  totalUsers: number;
  totalBags: number;
  totalCost: number;
  currentValue: number;
  userActivity: TUserActivity[];
  topBrands: TTopBrand[];
};

export type TDashboardStats = {
  success: boolean;
  data: TDashboardData;
};
