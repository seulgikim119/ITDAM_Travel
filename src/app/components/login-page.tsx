import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, LogIn } from "lucide-react";
import { StatusBar } from "./phone-frame";
import { login } from "../auth-store";

type LoginLocationState = {
  from?: string;
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const redirectTo = useMemo(() => state?.from ?? "/app/my", [state]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const canSubmit = name.trim().length > 1 && email.includes("@");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    login({ name, email });
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="h-full flex flex-col bg-[#FFF8E7]">
      <div className="bg-white border-b border-[#F0E6D0]">
        <StatusBar />
        <div className="flex items-center px-4 py-2">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#2C2C2A]">
            <ArrowLeft size={22} />
          </button>
          <h2 className="flex-1 text-center -mr-6 text-[#2C2C2A]" style={{ fontSize: 17, fontWeight: 700 }}>
            \uB85C\uADF8\uC778
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-6 space-y-4">
        <div>
          <p className="text-[#2C2C2A]" style={{ fontSize: 13, fontWeight: 700 }}>
            \uC774\uB984
          </p>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694"
            className="w-full mt-2 h-12 px-3 rounded-2xl border border-[#E8E8E8] bg-white outline-none"
            style={{ fontSize: 14 }}
          />
        </div>

        <div>
          <p className="text-[#2C2C2A]" style={{ fontSize: 13, fontWeight: 700 }}>
            \uC774\uBA54\uC77C
          </p>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full mt-2 h-12 px-3 rounded-2xl border border-[#E8E8E8] bg-white outline-none"
            style={{ fontSize: 14 }}
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-2xl text-[#2C2C2A] disabled:opacity-45 flex items-center justify-center gap-1.5"
          style={{ fontSize: 15, fontWeight: 800, background: "linear-gradient(135deg, #F0C070, #E8A830)" }}
        >
          <LogIn size={15} />
          \uB85C\uADF8\uC778\uD558\uACE0 \uC2DC\uC791\uD558\uAE30
        </button>

        <button
          type="button"
          onClick={() => navigate("/app", { replace: true })}
          className="w-full h-10 text-[#8E8E93]"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          \uBE44\uB85C\uADF8\uC778\uC73C\uB85C \uACC4\uC18D
        </button>
      </form>
    </div>
  );
}
