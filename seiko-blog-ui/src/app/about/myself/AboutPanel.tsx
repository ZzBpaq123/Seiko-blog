import { Mail, MapPin, Calendar } from "lucide-react";
import { EXPERIENCES } from "@/data/experiences";

export default function AboutPanel() {
  return (
    <section className="flex h-full w-screen shrink-0 flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid items-start gap-10 md:grid-cols-2">
          {/* 左侧 - 个人信息 */}
          <div>
            <h2 className="mb-6 font-bold text-white text-3xl sm:text-4xl">
              关于我
            </h2>
            <p className="mb-4 leading-relaxed text-gray-300">
              热爱技术，喜欢探索新东西。从后端开发起步，逐渐涉猎前端、AI
              等领域。相信持续学习的力量，也享受把想法变成代码的过程。
            </p>
            <p className="mb-6 leading-relaxed text-gray-300">
              工作之余喜欢玩游戏、听音乐、看电影，也会在这个博客上记录学习心得和技术分享。
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>中国</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>2000 年出生</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>1302183481@qq.com</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 时间线 */}
          <div>
            <h3 className="mb-6 text-xl font-bold text-white">经历</h3>
            <div className="relative border-l border-white/10 pl-6">
              {EXPERIENCES.map((item, index) => (
                <div key={index} className="relative mb-6 last:mb-0">
                  <span className="absolute -left-7.75 top-1 h-3 w-3 rounded-full border-2 border-blue-500 bg-zinc-950" />
                  <span className="mb-1 block text-sm text-blue-500">
                    {item.year}
                  </span>
                  <h4 className="mb-1 font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
