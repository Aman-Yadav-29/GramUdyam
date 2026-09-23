import { EnterpriseIdea } from '../../src/types/business.ts';
import { GovernmentScheme } from '../../src/types/schemes.ts';
import { LoanProduct } from '../../src/types/loans.ts';
import { DistrictIntelligence } from '../../src/types/location.ts';
import { UserAccount, SavedBusinessPlan } from '../../src/types/auth.ts';
import { ENTERPRISE_TEMPLATES } from '../../src/data/enterpriseTemplatesData.ts';
import { GOVERNMENT_SCHEMES } from '../../src/data/schemesData.ts';
import { LOAN_PRODUCTS } from '../../src/data/loanProductsData.ts';
import { DISTRICT_BENCHMARKS } from '../../src/data/locationBenchmarksData.ts';

/**
 * Entity Store for GramUdyam Data Models.
 * Provides typed CRUD operations ready to attach to Drizzle/Prisma/SQL when DATABASE_URL is configured.
 */
class EntityRepository {
  private users: Map<string, UserAccount> = new Map();
  private passwordHashes: Map<string, string> = new Map();
  private savedPlans: Map<string, SavedBusinessPlan> = new Map();
  private enterprises: Map<string, EnterpriseIdea> = new Map();
  private schemes: Map<string, GovernmentScheme> = new Map();
  private loanProducts: Map<string, LoanProduct> = new Map();
  private districtIntelligence: Map<string, DistrictIntelligence> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    ENTERPRISE_TEMPLATES.forEach((item) => this.enterprises.set(item.id, item));
    GOVERNMENT_SCHEMES.forEach((item) => this.schemes.set(item.code, item));
    LOAN_PRODUCTS.forEach((item) => this.loanProducts.set(item.id, item));
    DISTRICT_BENCHMARKS.forEach((item) => {
      const key = `${item.state.toLowerCase()}_${item.district.toLowerCase()}`;
      this.districtIntelligence.set(key, item);
    });
  }

  // Enterprises
  public getAllEnterprises(): EnterpriseIdea[] {
    return Array.from(this.enterprises.values());
  }

  public getEnterpriseById(id: string): EnterpriseIdea | undefined {
    return this.enterprises.get(id);
  }

  public queryEnterprises(capitalAvailable: number, category?: string): EnterpriseIdea[] {
    const all = this.getAllEnterprises();
    return all.filter((e) => {
      // Must be achievable within available capital (+ standard 75%-90% bank leverage)
      // If capital available is at least 10% of min required capital
      const minimumEquityRequired = e.minCapitalRequired * 0.10;
      const isAffordable = capitalAvailable >= minimumEquityRequired;
      const matchesCategory = !category || category === 'all' || e.category === category;
      return isAffordable && matchesCategory;
    });
  }

  // Schemes
  public getAllSchemes(): GovernmentScheme[] {
    return Array.from(this.schemes.values());
  }

  public getSchemeByCode(code: string): GovernmentScheme | undefined {
    return this.schemes.get(code.toUpperCase());
  }

  // Loan Products
  public getAllLoanProducts(): LoanProduct[] {
    return Array.from(this.loanProducts.values());
  }

  // Location / GIS
  public getDistrictIntelligence(state: string, district: string): DistrictIntelligence | undefined {
    const key = `${state.trim().toLowerCase()}_${district.trim().toLowerCase()}`;
    return this.districtIntelligence.get(key);
  }

  public getAllDistrictBenchmarks(): DistrictIntelligence[] {
    return Array.from(this.districtIntelligence.values());
  }

  // Users & Auth
  public createUser(user: UserAccount): UserAccount {
    this.users.set(user.id, user);
    return user;
  }

  public setPasswordHash(userId: string, hash: string): void {
    this.passwordHashes.set(userId, hash);
  }

  public getPasswordHash(userId: string): string | undefined {
    return this.passwordHashes.get(userId);
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    for (const u of this.users.values()) {
      if (u.email?.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return undefined;
  }

  // Saved Plans
  public savePlan(plan: SavedBusinessPlan): SavedBusinessPlan {
    this.savedPlans.set(plan.id, plan);
    return plan;
  }

  public getPlansByUserId(userId: string): SavedBusinessPlan[] {
    return Array.from(this.savedPlans.values()).filter((p) => p.userId === userId);
  }
}

export const entityRepository = new EntityRepository();
