
import { Question, SyllabusTopic } from "./types";

export const questions: Question[] = [
  // --- TOPIC 1: Basic Economic Ideas ---
  {
    id: "mj23-21-2a",
    year: "2023",
    paper: "9708/21",
    variant: "May/June",
    questionNumber: "2(a)",
    topic: SyllabusTopic.BASIC_IDEAS,
    chapter: "1.5 Production possibility curves",
    maxMarks: 8,
    questionText: "With the help of a diagram, explain the difference between the causes of a movement along, and a shift of, a production possibility curve (PPC) and consider which is likely to have the most immediate impact on an economy.",
    markScheme: `AO1 (3 marks): An understanding of a PPC shown through an accurate diagram, with correctly labelled axes (1), a movement along a PPC showing a trade-off between production on the two axes (1), and a shift of a PPC showing an increase in production of two goods with no trade-off (1).
AO2 (3 marks): Uses the PPC to explain that a movement along a PPC is caused by a reallocation of resources (1), as resources are shifted between the two types of product, involving an opportunity cost (1), but a shift of a PPC is caused by an increase in the quantity and/or quality of resources, allowing more of both goods to be produced (1).
AO3 (2 marks): Offers a valid judgement on whether a movement along, or a shift of, a PPC is likely to have the most immediate impact on an economy (1) to reach a conclusion (1).`
  },
  {
    id: "on24-21-3a",
    year: "2024",
    paper: "9708/21",
    variant: "Oct/Nov",
    questionNumber: "3(a)",
    topic: SyllabusTopic.BASIC_IDEAS,
    chapter: "1.5 Production possibility curves",
    maxMarks: 8,
    questionText: "With the help of a diagram, explain the significance of a position within a market economy's production possibility curve (PPC) and consider whether such a position is likely to be permanent.",
    markScheme: `AO1 (3 marks): Diagram of PPC. Axes appropriately labelled (e.g. manufactured/agricultural). PPC touches both axes. Position within PPC clearly shown.
AO2 (3 marks): Analysis of significance: economy using resources inefficiently, not all resources utilised, output lower than potential.
AO3 (2 marks): Valid judgement on whether position is permanent (e.g. business cycle, policy intervention) to reach a conclusion.`
  },

  // --- TOPIC 2: Price System ---
  {
    id: "fm23-22-2a",
    year: "2023",
    paper: "9708/22",
    variant: "Feb/March",
    questionNumber: "2(a)",
    topic: SyllabusTopic.PRICE_SYSTEM,
    chapter: "2.5 Consumer and producer surplus",
    maxMarks: 8,
    questionText: "With the help of a diagram(s), explain what is meant by consumer surplus and producer surplus and consider whether a rise in the price of a product because of higher costs of production is likely to always reduce the consumer surplus.",
    markScheme: `AO1 (3 marks): Understanding of consumer surplus (diff between willing to pay and market price) and producer surplus (diff between willing to accept and actual price). Diagram required.
AO2 (3 marks): Diagram showing left shift in supply. Explains change in CS for elastic vs inelastic demand.
AO3 (2 marks): Conclusion that CS always falls, but extent depends on PED.`
  },
  {
    id: "mj23-21-3a",
    year: "2023",
    paper: "9708/21",
    variant: "May/June",
    questionNumber: "3(a)",
    topic: SyllabusTopic.PRICE_SYSTEM,
    chapter: "2.2 Price elasticity, income elasticity and cross elasticity of demand",
    maxMarks: 8,
    questionText: "With the help of a formula, explain the meaning of cross elasticity of demand and consider which determinants are most important in establishing the size and sign of its coefficient.",
    markScheme: `AO1 (3 marks): Understanding of XED measure, formula, distinction between positive/negative.
AO2 (3 marks): Explanation of positive (substitutes), negative (complements). Determinants establishing magnitude (closeness of relationship).
AO3 (2 marks): Judgement on relative importance of determinants influencing magnitude/sign.`
  },
  {
    id: "on23-23-2a",
    year: "2023",
    paper: "9708/23",
    variant: "Oct/Nov",
    questionNumber: "2(a)",
    topic: SyllabusTopic.PRICE_SYSTEM,
    chapter: "2.3 Price elasticity of supply",
    maxMarks: 8,
    questionText: "The price elasticity of supply (PES) for a new smartphone is estimated to be 0.8 in the short run and 1.8 in the long run. Explain what these estimates mean for producers and consumers of smartphones and consider why the estimates differ.",
    markScheme: `AO1 (3 marks): Meaning of PES, formula, elastic/inelastic based on responsiveness.
AO2 (3 marks): Analysis of why values differ (time period, stock, production process).
AO3 (2 marks): Assessment of why impact on consumers/producers differs (availability, pricing, investment).`
  },
  {
    id: "on24-22-2a",
    year: "2024",
    paper: "9708/22",
    variant: "Oct/Nov",
    questionNumber: "2(a)",
    topic: SyllabusTopic.PRICE_SYSTEM,
    chapter: "2.1 Demand and supply curves",
    maxMarks: 8,
    questionText: "From 2030, the only new car production allowed in the United Kingdom (UK) will be for electric cars. Excluding the price of electric cars, explain the determinants of demand for electric cars and consider which of these determinants is likely to be of greatest significance at the present time.",
    markScheme: `AO1 (3 marks): Knowledge of determinants (income, substitutes, fashion/tastes/attitudes).
AO2 (3 marks): Analysis of significance (e.g., environmental attitudes, rising petrol prices making substitutes less attractive).
AO3 (2 marks): Consideration of most significant determinant. Justified conclusion.`
  },

  // --- TOPIC 3: Govt Micro Intervention ---
  {
    id: "fm23-22-2b",
    year: "2023",
    paper: "9708/22",
    variant: "Feb/March",
    questionNumber: "2(b)",
    topic: SyllabusTopic.GOVT_MICRO,
    chapter: "3.2 Methods and effects of government intervention in markets",
    maxMarks: 12,
    questionText: "A government wishes to keep the price of an essential food, such as rice, affordable to help low-income households. Assess whether a policy of fixing the maximum price for an essential food is likely to be more effective than a policy of making transfer payments to low-income households.",
    markScheme: `AO1/AO2 (8 marks): Max price analysis: affordable, helps poor, BUT shortage, informal markets, enforcement costs. Transfer payments: targeted, ensures affordability, BUT opportunity cost, misuse of funds.
AO3 (4 marks): Compare relative effectiveness. Considers impact on low-income consumers. Justified conclusion.`
  },
  {
    id: "mj23-22-3a",
    year: "2023",
    paper: "9708/22",
    variant: "May/June",
    questionNumber: "3(a)",
    topic: SyllabusTopic.GOVT_MICRO,
    chapter: "3.1 Reasons for government intervention in markets",
    maxMarks: 8,
    questionText: "Explain why government intervention may be required to provide merit goods and consider why such intervention may not always be successful.",
    markScheme: `AO1 (3 marks): Market failure, info failure, merit goods examples.
AO2 (3 marks): Reasons for provision: essential nature, private sector unwillingness, benefits to society.
AO3 (2 marks): Gov lack of resources/info. Justified conclusion.`
  },
  {
    id: "on24-23-2a",
    year: "2024",
    paper: "9708/23",
    variant: "Oct/Nov",
    questionNumber: "2(a)",
    topic: SyllabusTopic.GOVT_MICRO,
    chapter: "1.6 Classification of goods and services",
    maxMarks: 8,
    questionText: "With the use of examples, explain the difference between public goods and merit goods and consider whether markets will always provide enough of both goods.",
    markScheme: `AO1 (3 marks): Examples of BOTH. Characteristics of public (non-rival/non-excludable) and merit goods (under-consumed/info failure).
AO2 (3 marks): Market economy less likely to produce public goods (no profit) or enough merit goods.
AO3 (2 marks): Evaluation of whether enough can be produced. Valid conclusion.`
  },

  // --- TOPIC 4: The Macroeconomy ---
  {
    id: "fm23-22-4a",
    year: "2023",
    paper: "9708/22",
    variant: "Feb/March",
    questionNumber: "4(a)",
    topic: SyllabusTopic.MACROECONOMY,
    chapter: "4.2 Introduction to the circular flow of income",
    maxMarks: 8,
    questionText: "With the help of a circular flow of income diagram, explain how equilibrium is determined in an open economy and consider whether a budget deficit or a trade deficit is more likely to cause lasting disequilibrium.",
    markScheme: `AO1 (3 marks): Circular flow diagram (firms/households), injections (I, G, X), leakages (S, T, M). Equilibrium condition.
AO2 (3 marks): Explanation of injections/leakages. Equilibrium determination.
AO3 (2 marks): Consideration of budget vs trade deficit causing disequilibrium. Justified conclusion.`
  },
  {
    id: "mj23-22-5a",
    year: "2023",
    paper: "9708/22",
    variant: "May/June",
    questionNumber: "5(a)",
    topic: SyllabusTopic.MACROECONOMY,
    chapter: "5.3 Monetary policy",
    maxMarks: 8,
    questionText: "Explain how monetary policy may be able to reduce the rate of inflation in an economy and consider the likely success of this policy.",
    markScheme: `AO1 (3 marks): Understanding monetary policy, tools (interest rates, money supply), contractionary policy.
AO2 (3 marks): Explanation of applying tools to reduce inflation, impact on AD, price level, output, employment.
AO3 (2 marks): Effectiveness depends on consumer/firm response, rate/cause of inflation. Justified conclusion.`
  },
  {
    id: "on24-21-4a",
    year: "2024",
    paper: "9708/21",
    variant: "Oct/Nov",
    questionNumber: "4(a)",
    topic: SyllabusTopic.MACROECONOMY,
    chapter: "4.3 Aggregate Demand and Aggregate Supply analysis",
    maxMarks: 8,
    questionText: "Explain three of the components of aggregate demand and consider the extent to which they may be increased without leading to inflation.",
    markScheme: `AO1 (3 marks): Explanation of C, I, G, X-M.
AO2 (3 marks): Analysis that AD > AS causes inflation. Why it might not (spare capacity).
AO3 (2 marks): Evaluation. Inflation occurs if AD rises beyond full employment. Justified conclusion.`
  },

  // --- TOPIC 5: Govt Macro Intervention ---
  {
    id: "fm23-22-5b",
    year: "2023",
    paper: "9708/22",
    variant: "Feb/March",
    questionNumber: "5(b)",
    topic: SyllabusTopic.GOVT_MACRO,
    chapter: "5.4 Supply-side policy",
    maxMarks: 12,
    questionText: "Assess whether supply-side policies are the most effective way to correct a deficit on the current account of the balance of payments of an economy.",
    markScheme: `AO1/AO2 (8 marks): Supply-side policies (training, flexibilty, competition) -> efficient production -> competitive exports -> corrects deficit. Disadvantages: long-run, expensive. Comparison with fiscal/monetary/protectionist.
AO3 (4 marks): Consider cause of deficit, cost/ease, unintended consequences. Justified conclusion.`
  },
  {
    id: "mj24-22-3b",
    year: "2024",
    paper: "9708/22",
    variant: "May/June",
    questionNumber: "3(b)",
    topic: SyllabusTopic.GOVT_MACRO,
    chapter: "5.1 Government macroeconomic policy objectives",
    maxMarks: 12,
    questionText: "Assess whether producers are the only ones to benefit when an economy decides to allocate additional resources to investment.",
    markScheme: `AO1/AO2 (8 marks): Producers benefit (lower costs, competitiveness, profits). Consumers benefit (long term lower prices, choice). Govt benefits (tax revenue). Costs involved (taxes to fund investment, short term consumption sacrifice).
AO3 (4 marks): Assessment of whether *only* producers benefit. Depends on development level/govt involvement. Justified conclusion.`
  },
  {
    id: "on24-22-4b",
    year: "2024",
    paper: "9708/22",
    variant: "Oct/Nov",
    questionNumber: "4(b)",
    topic: SyllabusTopic.GOVT_MACRO,
    chapter: "5.2 Fiscal policy",
    maxMarks: 12,
    questionText: "Assess whether a government should always aim to balance its budget rather than have a budget surplus or a budget deficit.",
    markScheme: `AO1/AO2 (8 marks): Balanced budget meaning/significance. Budget deficit (expansionary) vs surplus (contractionary). Link to objectives (unemployment vs inflation).
AO3 (4 marks): Consideration of appropriateness for specific problems. Justified conclusion.`
  },

  // --- TOPIC 6: International Economic Issues ---
  {
    id: "mj24-22-5a",
    year: "2024",
    paper: "9708/22",
    variant: "May/June",
    questionNumber: "5(a)",
    topic: SyllabusTopic.INTERNATIONAL,
    chapter: "6.2 Protectionism",
    maxMarks: 8,
    questionText: "Explain the potential advantages of free trade and consider whether such advantages are always greater than the potential disadvantages of free trade.",
    markScheme: `AO1 (3 marks): Knowledge of advantages (world output, choice, standard of living).
AO2 (3 marks): Explanation of disadvantages (specialisation risks, unemployment, security). Contrast.
AO3 (2 marks): Valid judgement on whether advantages always outweigh disadvantages. Justified conclusion.`
  },
  {
    id: "on23-23-5a",
    year: "2023",
    paper: "9708/23",
    variant: "Oct/Nov",
    questionNumber: "5(a)",
    topic: SyllabusTopic.INTERNATIONAL,
    chapter: "6.5 Policies to correct imbalances in the current account",
    maxMarks: 8,
    questionText: "Explain how import tariffs might correct an imbalance in the current account of the balance of payments and consider whether these tariffs are the best way of correcting such an imbalance.",
    markScheme: `AO1 (3 marks): Tariff meaning, current account, imbalance (deficit/surplus).
AO2 (3 marks): Analysis of tariff effect on import prices/consumption/imbalance.
AO3 (2 marks): Effect uncertain (PED). Other policies? Retaliation? Justified conclusion.`
  },
  {
    id: "on24-21-5b",
    year: "2024",
    paper: "9708/21",
    variant: "Oct/Nov",
    questionNumber: "5(b)",
    topic: SyllabusTopic.INTERNATIONAL,
    chapter: "6.5 Policies to correct imbalances in the current account",
    maxMarks: 12,
    questionText: "Assess whether protectionism is always the best way of reducing a deficit on the current account of the balance of payments.",
    markScheme: `AO1/AO2 (8 marks): Protectionism advantages (tariffs reduce imports, infant industries). Problems (PED, retaliation, cost-push inflation). Alternative policies (contractionary monetary).
AO3 (4 marks): Assessment of protectionism vs other policies. Justified conclusion.`
  }
];
