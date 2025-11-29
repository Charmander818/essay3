
import { SyllabusTopic } from "./types";

export type Level = "AS" | "A Level";

export const SYLLABUS_STRUCTURE = {
  AS: {
    topics: [
      SyllabusTopic.BASIC_IDEAS,
      SyllabusTopic.PRICE_SYSTEM,
      SyllabusTopic.GOVT_MICRO,
      SyllabusTopic.MACROECONOMY,
      SyllabusTopic.GOVT_MACRO,
      SyllabusTopic.INTERNATIONAL
    ],
    chapters: {
      [SyllabusTopic.BASIC_IDEAS]: [
        "1.1 Scarcity, choice and opportunity cost",
        "1.2 Economic methodology",
        "1.3 Factors of production",
        "1.4 Resource allocation in different economic systems",
        "1.5 Production possibility curves",
        "1.6 Classification of goods and services"
      ],
      [SyllabusTopic.PRICE_SYSTEM]: [
        "2.1 Demand and supply curves",
        "2.2 Price elasticity, income elasticity and cross elasticity of demand",
        "2.3 Price elasticity of supply",
        "2.4 The interaction of demand and supply",
        "2.5 Consumer and producer surplus"
      ],
      [SyllabusTopic.GOVT_MICRO]: [
        "3.1 Reasons for government intervention in markets",
        "3.2 Methods and effects of government intervention in markets",
        "3.3 Addressing income and wealth inequality"
      ],
      [SyllabusTopic.MACROECONOMY]: [
        "4.1 National income statistics",
        "4.2 Introduction to the circular flow of income",
        "4.3 Aggregate Demand and Aggregate Supply analysis",
        "4.4 Economic growth",
        "4.5 Unemployment",
        "4.6 Price stability"
      ],
      [SyllabusTopic.GOVT_MACRO]: [
        "5.1 Government macroeconomic policy objectives",
        "5.2 Fiscal policy",
        "5.3 Monetary policy",
        "5.4 Supply-side policy"
      ],
      [SyllabusTopic.INTERNATIONAL]: [
        "6.1 The reasons for international trade",
        "6.2 Protectionism",
        "6.3 Current account of the balance of payments",
        "6.4 Exchange rates",
        "6.5 Policies to correct imbalances in the current account of the balance of payments"
      ]
    }
  },
  "A Level": {
    topics: [
      SyllabusTopic.PRICE_SYSTEM_AL,
      SyllabusTopic.GOVT_MICRO_AL,
      SyllabusTopic.MACROECONOMY_AL,
      SyllabusTopic.GOVT_MACRO_AL,
      SyllabusTopic.INTERNATIONAL_AL
    ],
    chapters: {
      [SyllabusTopic.PRICE_SYSTEM_AL]: [
        "7.1 Utility",
        "7.2 Indifference curves and budget lines",
        "7.3 Efficiency and market failure",
        "7.4 Private costs and benefits, externalities and social costs and benefits",
        "7.5 Types of cost, revenue and profit, short-run and long-run production",
        "7.6 Different market structures",
        "7.7 Growth and survival of firms",
        "7.8 Differing objectives and policies of firms"
      ],
      [SyllabusTopic.GOVT_MICRO_AL]: [
        "8.1 Government policies to achieve efficient resource allocation and correct market failure",
        "8.2 Equity and redistribution of income and wealth",
        "8.3 Labour market forces and government intervention"
      ],
      [SyllabusTopic.MACROECONOMY_AL]: [
        "9.1 The circular flow of income",
        "9.2 Economic growth and sustainability",
        "9.3 Employment/unemployment",
        "9.4 Money and banking"
      ],
      [SyllabusTopic.GOVT_MACRO_AL]: [
        "10.1 Government macroeconomic policy objectives",
        "10.2 Links between macroeconomic problems and their interrelatedness",
        "10.3 Effectiveness of policy options to meet all macroeconomic objectives"
      ],
      [SyllabusTopic.INTERNATIONAL_AL]: [
        "11.1 Policies to correct disequilibrium in the balance of payments",
        "11.2 Exchange rates",
        "11.3 Economic development",
        "11.4 Characteristics of countries at different levels of development",
        "11.5 Relationship between countries at different levels of development",
        "11.6 Globalisation"
      ]
    }
  }
};
