import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

const DashboardPreview = () => {
  const mockData = {
    winRates: [
      { horse: "Thunder Bolt", rate: 85 },
      { horse: "Silver Arrow", rate: 78 },
      { horse: "Golden Hoof", rate: 72 },
      { horse: "Midnight Runner", rate: 68 },
      { horse: "Storm Chaser", rate: 65 },
    ],
    performance: [
      { month: "Jan", value: 65 },
      { month: "Feb", value: 72 },
      { month: "Mar", value: 78 },
      { month: "Apr", value: 82 },
      { month: "May", value: 88 },
      { month: "Jun", value: 85 },
    ],
  };

  return (
    <section id="analytics" className="py-24 bg-racing-dark">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        <div className="mb-20 text-center animate-fade-in">
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl font-display">
            Advanced Analytics Dashboard
          </h2>
          <p className="max-w-4xl mx-auto text-xl leading-relaxed text-racing-light">
            Real-time insights powered by AI to help you make data-driven betting decisions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 mb-16 lg:grid-cols-2">
          {/* Win Rate Chart */}
          <div className="p-8 transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-primary/30 hover:shadow-2xl hover:shadow-racing-primary/10 animate-slide-up">
            <div className="flex items-center mb-8">
              <BarChart3 className="mr-4 w-7 h-7 text-racing-primary" />
              <h3 className="text-2xl font-semibold text-white">Win Rate Analysis</h3>
            </div>
            <div className="space-y-5">
              {mockData.winRates.map((horse, index) => (
                <div key={horse.horse} className="flex items-center justify-between p-3 transition-all duration-300 rounded-lg group hover:bg-white/5">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 mr-4 text-sm font-bold text-white transition-transform duration-300 rounded-full bg-racing-primary group-hover:scale-110">
                      {index + 1}
                    </div>
                    <span className="font-medium transition-colors duration-300 text-racing-light group-hover:text-white">{horse.horse}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 mr-4 overflow-hidden rounded-full w-28 bg-gray-700/50">
                      <div
                        className="h-3 transition-all duration-1000 ease-out rounded-full bg-gradient-to-r from-racing-primary to-racing-secondary"
                        style={{ width: `${horse.rate}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold text-white">{horse.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend */}
          <div className="p-8 transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-secondary/30 hover:shadow-2xl hover:shadow-racing-secondary/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center mb-8">
              <TrendingUp className="mr-4 w-7 h-7 text-racing-secondary" />
              <h3 className="text-2xl font-semibold text-white">Performance Trends</h3>
            </div>
            <div className="flex items-end justify-between h-40">
              {mockData.performance.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center group">
                  <div
                    className="w-10 mb-3 transition-all duration-300 rounded-t shadow-lg bg-gradient-to-t from-racing-secondary to-racing-accent group-hover:scale-110"
                    style={{ height: `${data.value * 1.4}px`, animationDelay: `${index * 0.1}s` }}
                  ></div>
                  <span className="text-sm font-medium transition-colors duration-300 text-racing-light group-hover:text-white">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-8 text-center transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-primary/30 hover:shadow-2xl hover:shadow-racing-primary/10 hover:scale-105 animate-scale-in">
            <Users className="w-10 h-10 mx-auto mb-4 text-racing-primary" />
            <div className="mb-2 text-3xl font-bold text-white">2,847</div>
            <div className="font-medium text-racing-light">Active Users</div>
          </div>
          <div className="p-8 text-center transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-secondary/30 hover:shadow-2xl hover:shadow-racing-secondary/10 hover:scale-105 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <BarChart3 className="w-10 h-10 mx-auto mb-4 text-racing-secondary" />
            <div className="mb-2 text-3xl font-bold text-white">94.2%</div>
            <div className="font-medium text-racing-light">Accuracy Rate</div>
          </div>
          <div className="p-8 text-center transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-racing-accent/30 hover:shadow-2xl hover:shadow-racing-accent/10 hover:scale-105 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <TrendingUp className="w-10 h-10 mx-auto mb-4 text-racing-accent" />
            <div className="mb-2 text-3xl font-bold text-white">156K</div>
            <div className="font-medium text-racing-light">Predictions Made</div>
          </div>
          <div className="p-8 text-center transition-all duration-500 border bg-racing-darker/50 backdrop-blur-sm border-gray-800/50 rounded-2xl hover:border-orange-400/30 hover:shadow-2xl hover:shadow-orange-400/10 hover:scale-105 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Clock className="w-10 h-10 mx-auto mb-4 text-orange-400" />
            <div className="mb-2 text-3xl font-bold text-white">0.3s</div>
            <div className="font-medium text-racing-light">Response Time</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
