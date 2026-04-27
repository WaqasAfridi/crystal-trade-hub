import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../store/auth";
import { Button, Input, Label, Card, CardBody } from "../components/ui";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/admin/auth/login", { username, password });
      setAuth(data.token, data.admin);
      toast.success("Welcome back");
      navigate("/", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardBody>
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-elevated border border-border flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6 text-text" />
            </div>
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <p className="text-sm text-muted mt-1">Crystal Trade Hub</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Username or email</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoFocus
                required
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>

          <p className="text-xs text-muted mt-6 text-center">
            Default seeded admin: <span className="text-text font-mono">admin / Admin@12345</span>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
