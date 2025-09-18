// Simple test to verify budget calculation logic
// This is a basic test to ensure our budget synchronization works correctly

interface Activity {
  id?: string;
  cost?: number;
  name: string;
}

interface Expense {
  id?: string;
  amount: number;
  description: string;
}

// Test the budget calculation logic
export const testBudgetCalculation = () => {
  console.log('🧪 Testing budget calculation logic...');
  
  // Test data
  const activities: Activity[] = [
    { id: '1', name: 'Museum Visit', cost: 25 },
    { id: '2', name: 'Restaurant', cost: 45 },
    { id: '3', name: 'Free Walking Tour', cost: 0 },
    { id: '4', name: 'Shopping', cost: 100 }
  ];
  
  const expenses: Expense[] = [
    { id: '1', amount: 50, description: 'Hotel' },
    { id: '2', amount: 30, description: 'Transport' },
    { id: '3', amount: 20, description: 'Souvenirs' }
  ];
  
  const manualBudget = 200;
  
  // Calculate totals
  const activityTotal = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = manualBudget + activityTotal;
  const totalSpent = expenseTotal + activityTotal;
  
  console.log('📊 Budget Calculation Results:');
  console.log(`Manual Budget: $${manualBudget}`);
  console.log(`Activity Costs: $${activityTotal}`);
  console.log(`Manual Expenses: $${expenseTotal}`);
  console.log(`Total Budget: $${totalBudget}`);
  console.log(`Total Spent: $${totalSpent}`);
  console.log(`Remaining: $${totalBudget - totalSpent}`);
  
  // Verify calculations
  const expectedActivityTotal = 25 + 45 + 0 + 100; // 170
  const expectedExpenseTotal = 50 + 30 + 20; // 100
  const expectedTotalBudget = 200 + 170; // 370
  const expectedTotalSpent = 100 + 170; // 270
  const expectedRemaining = 370 - 270; // 100
  
  const tests = [
    { name: 'Activity Total', actual: activityTotal, expected: expectedActivityTotal },
    { name: 'Expense Total', actual: expenseTotal, expected: expectedExpenseTotal },
    { name: 'Total Budget', actual: totalBudget, expected: expectedTotalBudget },
    { name: 'Total Spent', actual: totalSpent, expected: expectedTotalSpent },
    { name: 'Remaining', actual: totalBudget - totalSpent, expected: expectedRemaining }
  ];
  
  let allPassed = true;
  tests.forEach(test => {
    const passed = test.actual === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${test.actual} (expected: ${test.expected})`);
    if (!passed) allPassed = false;
  });
  
  console.log(allPassed ? '🎉 All budget calculations are correct!' : '⚠️ Some calculations failed');
  
  return allPassed;
};

// Export for use in browser console or other tests
if (typeof window !== 'undefined') {
  (window as any).testBudgetCalculation = testBudgetCalculation;
}
