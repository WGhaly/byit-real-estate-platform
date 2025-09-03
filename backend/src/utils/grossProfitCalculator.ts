// Gross Profit Calculation Engine
// Formula: Gross Profit = Actual Commission - (Communicated Commission - Broker Commission)

import { Decimal } from '@prisma/client/runtime/library';

export interface GrossProfitCalculationParams {
  actualCommission: number | Decimal;
  communicatedCommission: number | Decimal;
  brokerCommission: number | Decimal;
  dealValue: number | Decimal;
  commissionRate: number | Decimal;
  bonusCommissionRate?: number | Decimal;
}

export interface GrossProfitResult {
  grossProfit: Decimal;
  grossProfitPercentage: Decimal;
  actualCommission: Decimal;
  communicatedCommission: Decimal;
  brokerCommission: Decimal;
  platformMargin: Decimal;
  platformMarginPercentage: Decimal;
  profitability: 'HIGH' | 'MEDIUM' | 'LOW' | 'LOSS';
  breakdown: {
    dealValue: Decimal;
    commissionRate: Decimal;
    bonusCommissionRate: Decimal;
    calculatedCommission: Decimal;
    brokerShare: Decimal;
    platformShare: Decimal;
  };
}

export class GrossProfitCalculator {
  
  /**
   * Calculate gross profit using the Egyptian real estate commission structure
   * Formula: Gross Profit = Actual Commission - (Communicated Commission - Broker Commission)
   */
  static calculateGrossProfit(params: GrossProfitCalculationParams): GrossProfitResult {
    const {
      actualCommission,
      communicatedCommission,
      brokerCommission,
      dealValue,
      commissionRate,
      bonusCommissionRate = 0
    } = params;

    // Convert all values to Decimal for precise calculations
    const actualCommissionDecimal = new Decimal(actualCommission.toString());
    const communicatedCommissionDecimal = new Decimal(communicatedCommission.toString());
    const brokerCommissionDecimal = new Decimal(brokerCommission.toString());
    const dealValueDecimal = new Decimal(dealValue.toString());
    const commissionRateDecimal = new Decimal(commissionRate.toString());
    const bonusCommissionRateDecimal = new Decimal(bonusCommissionRate.toString());

    // Calculate the expected commission based on deal value and rates
    const baseCommission = dealValueDecimal.mul(commissionRateDecimal).div(100);
    const bonusCommission = dealValueDecimal.mul(bonusCommissionRateDecimal).div(100);
    const calculatedCommission = baseCommission.add(bonusCommission);

    // Calculate gross profit using the specified formula
    const platformCost = communicatedCommissionDecimal.sub(brokerCommissionDecimal);
    const grossProfit = actualCommissionDecimal.sub(platformCost);

    // Calculate platform margin (what the platform keeps after broker payment)
    const platformMargin = actualCommissionDecimal.sub(brokerCommissionDecimal);
    
    // Calculate percentages
    const grossProfitPercentage = dealValueDecimal.gt(0) 
      ? grossProfit.div(dealValueDecimal).mul(100)
      : new Decimal(0);
    
    const platformMarginPercentage = dealValueDecimal.gt(0)
      ? platformMargin.div(dealValueDecimal).mul(100)
      : new Decimal(0);

    // Determine profitability level
    let profitability: 'HIGH' | 'MEDIUM' | 'LOW' | 'LOSS';
    if (grossProfit.lt(0)) {
      profitability = 'LOSS';
    } else if (grossProfitPercentage.gte(2)) {
      profitability = 'HIGH';
    } else if (grossProfitPercentage.gte(1)) {
      profitability = 'MEDIUM';
    } else {
      profitability = 'LOW';
    }

    // Calculate broker and platform shares
    const brokerShare = brokerCommissionDecimal;
    const platformShare = actualCommissionDecimal.sub(brokerCommissionDecimal);

    return {
      grossProfit,
      grossProfitPercentage,
      actualCommission: actualCommissionDecimal,
      communicatedCommission: communicatedCommissionDecimal,
      brokerCommission: brokerCommissionDecimal,
      platformMargin,
      platformMarginPercentage,
      profitability,
      breakdown: {
        dealValue: dealValueDecimal,
        commissionRate: commissionRateDecimal,
        bonusCommissionRate: bonusCommissionRateDecimal,
        calculatedCommission,
        brokerShare,
        platformShare
      }
    };
  }

  /**
   * Calculate optimal commission structure for maximum profitability
   */
  static calculateOptimalCommission(
    dealValue: number | Decimal,
    targetGrossProfitPercentage: number = 1.5
  ): {
    recommendedCommissionRate: Decimal;
    recommendedBrokerRate: Decimal;
    projectedGrossProfit: Decimal;
    projectedRevenue: Decimal;
  } {
    const dealValueDecimal = new Decimal(dealValue.toString());
    const targetGrossProfitDecimal = new Decimal(targetGrossProfitPercentage.toString());

    // Standard Egyptian market rates
    const standardBrokerRate = new Decimal(1.5); // 1.5% to broker
    const targetTotalRate = targetGrossProfitDecimal.add(standardBrokerRate); // Target total commission rate

    const projectedRevenue = dealValueDecimal.mul(targetTotalRate).div(100);
    const projectedGrossProfit = dealValueDecimal.mul(targetGrossProfitDecimal).div(100);

    return {
      recommendedCommissionRate: targetTotalRate,
      recommendedBrokerRate: standardBrokerRate,
      projectedGrossProfit,
      projectedRevenue
    };
  }

  /**
   * Analyze commission performance across multiple deals
   */
  static analyzePortfolioPerformance(deals: GrossProfitCalculationParams[]): {
    totalGrossProfit: Decimal;
    averageGrossProfitPercentage: Decimal;
    totalRevenue: Decimal;
    totalBrokerCommissions: Decimal;
    totalPlatformMargin: Decimal;
    profitabilityDistribution: {
      HIGH: number;
      MEDIUM: number;
      LOW: number;
      LOSS: number;
    };
    recommendations: string[];
  } {
    if (deals.length === 0) {
      return {
        totalGrossProfit: new Decimal(0),
        averageGrossProfitPercentage: new Decimal(0),
        totalRevenue: new Decimal(0),
        totalBrokerCommissions: new Decimal(0),
        totalPlatformMargin: new Decimal(0),
        profitabilityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0, LOSS: 0 },
        recommendations: []
      };
    }

    const results = deals.map(deal => this.calculateGrossProfit(deal));
    
    const totalGrossProfit = results.reduce((sum, result) => sum.add(result.grossProfit), new Decimal(0));
    const totalRevenue = results.reduce((sum, result) => sum.add(result.actualCommission), new Decimal(0));
    const totalBrokerCommissions = results.reduce((sum, result) => sum.add(result.brokerCommission), new Decimal(0));
    const totalPlatformMargin = results.reduce((sum, result) => sum.add(result.platformMargin), new Decimal(0));
    
    const averageGrossProfitPercentage = results.reduce(
      (sum, result) => sum.add(result.grossProfitPercentage), 
      new Decimal(0)
    ).div(results.length);

    const profitabilityDistribution = results.reduce(
      (dist, result) => {
        dist[result.profitability]++;
        return dist;
      },
      { HIGH: 0, MEDIUM: 0, LOW: 0, LOSS: 0 }
    );

    // Generate recommendations
    const recommendations: string[] = [];
    const lossPercentage = (profitabilityDistribution.LOSS / deals.length) * 100;
    const lowPercentage = (profitabilityDistribution.LOW / deals.length) * 100;

    if (lossPercentage > 10) {
      recommendations.push('Critical: More than 10% of deals are generating losses. Review commission structures immediately.');
    }
    if (lowPercentage > 30) {
      recommendations.push('Warning: More than 30% of deals have low profitability. Consider optimizing broker commission rates.');
    }
    if (averageGrossProfitPercentage.lt(1)) {
      recommendations.push('Average gross profit margin is below 1%. Recommend increasing commission rates or reducing broker rates.');
    }
    if (profitabilityDistribution.HIGH < deals.length * 0.3) {
      recommendations.push('Less than 30% of deals are highly profitable. Focus on higher-value deals and premium projects.');
    }

    return {
      totalGrossProfit,
      averageGrossProfitPercentage,
      totalRevenue,
      totalBrokerCommissions,
      totalPlatformMargin,
      profitabilityDistribution,
      recommendations
    };
  }

  /**
   * Calculate commission impact of changing broker rates
   */
  static simulateCommissionChanges(
    currentParams: GrossProfitCalculationParams,
    newBrokerCommissionRate: number
  ): {
    current: GrossProfitResult;
    projected: GrossProfitResult;
    impact: {
      grossProfitChange: Decimal;
      grossProfitPercentageChange: Decimal;
      profitabilityImprovement: boolean;
    };
  } {
    const current = this.calculateGrossProfit(currentParams);
    
    const newBrokerCommission = new Decimal(currentParams.dealValue.toString())
      .mul(newBrokerCommissionRate)
      .div(100);
    
    const projectedParams = {
      ...currentParams,
      brokerCommission: newBrokerCommission
    };
    
    const projected = this.calculateGrossProfit(projectedParams);
    
    const grossProfitChange = projected.grossProfit.sub(current.grossProfit);
    const grossProfitPercentageChange = projected.grossProfitPercentage.sub(current.grossProfitPercentage);
    
    const profitabilityImprovement = (
      (current.profitability === 'LOSS' && projected.profitability !== 'LOSS') ||
      (current.profitability === 'LOW' && ['MEDIUM', 'HIGH'].includes(projected.profitability)) ||
      (current.profitability === 'MEDIUM' && projected.profitability === 'HIGH')
    );

    return {
      current,
      projected,
      impact: {
        grossProfitChange,
        grossProfitPercentageChange,
        profitabilityImprovement
      }
    };
  }
}

// Utility functions for Egyptian market-specific calculations
export class EgyptianMarketCalculator {
  
  /**
   * Calculate commission based on Egyptian market standards
   */
  static calculateEgyptianCommission(
    dealValue: number,
    projectType: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_USE' | 'VACATION_HOMES',
    location: string
  ): {
    recommendedRate: Decimal;
    brokerRate: Decimal;
    platformRate: Decimal;
  } {
    let baseRate = 2.5; // Default 2.5%
    let brokerRate = 1.5; // Default 1.5% to broker

    // Adjust rates based on project type
    switch (projectType) {
      case 'VACATION_HOMES':
        baseRate = 3.0; // Higher for vacation homes
        brokerRate = 2.0;
        break;
      case 'COMMERCIAL':
        baseRate = 2.0; // Lower for commercial
        brokerRate = 1.2;
        break;
      case 'MIXED_USE':
        baseRate = 2.8;
        brokerRate = 1.8;
        break;
    }

    // Adjust based on location (premium locations)
    const premiumLocations = [
      'العاصمة الإدارية الجديدة',
      'الساحل الشمالي',
      'شرم الشيخ',
      'القاهرة الجديدة'
    ];

    if (premiumLocations.some(loc => location.includes(loc))) {
      baseRate += 0.5; // Add 0.5% for premium locations
      brokerRate += 0.3; // Add 0.3% for broker in premium locations
    }

    const platformRate = baseRate - brokerRate;

    return {
      recommendedRate: new Decimal(baseRate),
      brokerRate: new Decimal(brokerRate),
      platformRate: new Decimal(platformRate)
    };
  }

  /**
   * Calculate taxes and fees for Egyptian market
   */
  static calculateEgyptianTaxes(grossProfit: Decimal): {
    corporateTax: Decimal;
    vatTax: Decimal;
    netProfit: Decimal;
  } {
    // Egyptian corporate tax rate: 22.5%
    const corporateTaxRate = new Decimal(22.5);
    const corporateTax = grossProfit.mul(corporateTaxRate).div(100);

    // VAT on commission services: 14%
    const vatRate = new Decimal(14);
    const vatTax = grossProfit.mul(vatRate).div(100);

    const netProfit = grossProfit.sub(corporateTax).sub(vatTax);

    return {
      corporateTax,
      vatTax,
      netProfit
    };
  }
}
