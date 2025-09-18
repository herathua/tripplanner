import React from 'react';
import { Plus, DollarSign, Trash2, MapPin } from 'lucide-react';
import { Expense } from '../../contexts/TripContext';
import { Activity } from '../../services/itineraryService';

interface BudgetSectionProps {
  budget: number;
  totalSpent: number;
  expenses: Expense[];
  activities: Activity[];
  onAddExpense: () => void;
  onDeleteExpense: (expenseId: string) => void;
  getExpenseCategoryIcon: (category: string) => React.ReactNode;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({
  budget,
  totalSpent,
  expenses,
  activities,
  onAddExpense,
  onDeleteExpense,
  getExpenseCategoryIcon
}) => {
  const remainingBudget = budget - totalSpent;
  
  // Calculate activity costs breakdown
  const activityCosts = activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
  const manualExpenseCosts = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section id="budgeting" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Budget</h2>
        <button 
          onClick={onAddExpense}
          className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
          <div className="h-full p-6 rounded-lg bg-blue-50">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Total Budget</h3>
            <p className="text-2xl font-semibold text-blue-600">${budget.toLocaleString()}</p>
          </div>
          <div className="h-full p-6 rounded-lg bg-purple-50">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Activity Costs</h3>
            <p className="text-2xl font-semibold text-purple-600">${activityCosts.toLocaleString()}</p>
          </div>
          <div className="h-full p-6 rounded-lg bg-green-50">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Manual Expenses</h3>
            <p className="text-2xl font-semibold text-green-600">${manualExpenseCosts.toLocaleString()}</p>
          </div>
          <div className="h-full p-6 rounded-lg bg-yellow-50">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Remaining</h3>
            <p className="text-2xl font-semibold text-yellow-600">${remainingBudget.toLocaleString()}</p>
          </div>
        </div>
        
        {!expenses.length && !activities.length ? (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg font-medium mb-2">No expenses or activities added yet</p>
            <p className="text-sm text-gray-400 mb-4">Add activities with costs or click "Add Expense" to start tracking your budget</p>
            <button 
              onClick={onAddExpense}
              className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Activity Costs Section */}
            {activityCosts > 0 && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Activity Costs</span>
                  </div>
                  <span className="font-semibold text-blue-900">${activityCosts.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {activities.filter(activity => activity.cost && activity.cost > 0).map(activity => (
                    <div key={activity.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Day {activity.dayNumber || 'N/A'}</span>
                        <span className="text-gray-900">{activity.name}</span>
                      </div>
                      <span className="font-medium text-blue-700">${activity.cost?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Expenses Section */}
            {expenses.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Manual Expenses</h4>
                {['accommodation', 'food', 'transport', 'activities', 'shopping', 'other'].map(category => {
                  const categoryExpenses = expenses.filter(e => e.category === category);
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
                  
                  if (categoryTotal === 0) return null;
                  
                  return (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getExpenseCategoryIcon(category)}
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <span className="font-semibold text-gray-900">${categoryTotal.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        {categoryExpenses.map(expense => (
                          <div key={expense.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600">Day {expense.dayNumber}</span>
                              <span className="text-gray-900">{expense.description}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">${expense.amount.toLocaleString()}</span>
                              <button 
                                onClick={() => expense.id && onDeleteExpense(expense.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default BudgetSection;
