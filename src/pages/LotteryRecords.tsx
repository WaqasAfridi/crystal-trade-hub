import { motion } from "framer-motion";
import { Trophy, Ticket } from "lucide-react";

const lotteryRecords = [
  { id: 1, date: "2026-04-05", ticket: "#28451", prize: "100 USDT", status: "Won" },
  { id: 2, date: "2026-04-04", ticket: "#28320", prize: "-", status: "No Prize" },
  { id: 3, date: "2026-04-03", ticket: "#28199", prize: "50 USDT", status: "Won" },
  { id: 4, date: "2026-04-02", ticket: "#28050", prize: "-", status: "No Prize" },
  { id: 5, date: "2026-04-01", ticket: "#27900", prize: "-", status: "No Prize" },
];

const LotteryRecords = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Lottery Records</h1>
          <p className="text-muted-foreground">View your lottery history and winnings</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">150 USDT</p>
            <p className="text-xs text-muted-foreground">Total Winnings</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <Ticket className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-xs text-muted-foreground">Total Tickets</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">Ticket</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Prize</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {lotteryRecords.map((record) => (
                <tr key={record.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-4 px-6 text-sm text-foreground">{record.date}</td>
                  <td className="py-4 px-6 text-sm text-muted-foreground font-mono">{record.ticket}</td>
                  <td className="text-right py-4 px-6 text-sm font-medium text-foreground">{record.prize}</td>
                  <td className="text-right py-4 px-6">
                    <span className={`text-xs px-2 py-1 rounded-full ${record.status === "Won" ? "bg-green-400/10 text-green-400" : "bg-secondary text-muted-foreground"}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LotteryRecords;
