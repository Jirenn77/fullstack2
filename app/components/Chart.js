import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function BranchPieChart({ data }) {
  const activeBranches = data.filter((branch) => branch.value > 0);

  const isSingleSlice = activeBranches.length === 1;

  const chartData = isSingleSlice
    ? [
        ...activeBranches,
        {
          name: 'Other',
          value: 0.0001, // dummy invisible slice
        },
      ]
    : activeBranches;

  return chartData.length === 0 ? (
    <div className="text-center text-sm text-gray-500">No revenue data</div>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
          }
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length] || '#ccc'}
            />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
