import { Invoice, Play, Performance, EnrichedPerformance } from "./types/";

function createPerformanceCalculator(aPerformance: Performance, aPlay: Play) {
  switch (aPlay.type) {
    case "tragedy":
      return new TragedyCalculator(aPerformance, aPlay);
    case "comedy":
      return new ComedyCalculator(aPerformance, aPlay);
    default:
      throw new Error(`Unknown type: ${aPlay.type}`);
  }
}

class PerformanceCalculator {
  performance: Performance;
  play: Play;

  constructor(aPerformance: Performance, aPlay: Play) {
    this.performance = aPerformance;
    this.play = aPlay;
  }

  get amount(): number {
    throw new Error("Subclass responsability");
  }

  get volumeCredits() {
    let result = 0;
    result += Math.max(this.performance.audience - 30, 0);
    if ("comedy" == this.play.type)
      result += Math.floor(this.performance.audience / 5);
    return result;
  }
}

class TragedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 40000;
    if (this.performance.audience > 30) {
      result += 1000 * (this.performance.audience - 30);
    }
    return result;
  }
}

class ComedyCalculator extends PerformanceCalculator {
  get amount() {
    let result = 30000;
    if (this.performance.audience > 20) {
      result += 10000 + 500 * (this.performance.audience - 20);
    }
    result += 300 * this.performance.audience;
    return result;
  }
}

export default function createStatementData(invoice: Invoice, plays: any) {
  const result = {} as any;
  result.customer = invoice.customer;
  result.performances = invoice.performances.map(enrichPerformance);
  result.totalAmount = totalAmount(result);
  result.totalVolumeCredits = totalVolumeCredits(result);
  return result;

  function enrichPerformance(aPerformance: Performance): EnrichedPerformance {
    const calculator = createPerformanceCalculator(
      aPerformance,
      playFor(aPerformance)
    );
    const result: any = Object.assign({}, aPerformance);
    result.play = calculator.play;
    result.amount = calculator.amount;
    result.volumeCredits = calculator.volumeCredits;
    return result;
  }

  function playFor(aPerformance: Performance): Play {
    return plays[aPerformance.playID];
  }

  // function amountFor(aPerformance: EnrichedPerformance) {
  //   return new PerformanceCalculator(aPerformance, playFor(aPerformance)).amount;
  // }

  // function volumeCreditsFor(aPerformance: EnrichedPerformance): number {
  //   let result = 0;
  //   result += Math.max(aPerformance.audience - 30, 0);
  //   if ("comedy" == aPerformance.play.type)
  //     result += Math.floor(aPerformance.audience / 5);
  //   return result;
  // }

  function totalVolumeCredits(data: any) {
    return data.performances.reduce(
      (total: any, p: any) => total + p.volumeCredits,
      0
    );
  }

  function totalAmount(data: any) {
    return data.performances.reduce(
      (total: number, p: any) => total + p.amount,
      0
    );
  }
}
