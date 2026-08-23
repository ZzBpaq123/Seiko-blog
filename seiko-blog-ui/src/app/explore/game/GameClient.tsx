"use client";

import Image from "next/image";
import {BookOpen, FileText, FlaskConical, Globe, Map} from "lucide-react";
import type {Game} from "@/data/games";
import {surfaceColors} from "@/data/games";

interface GameClientProps {
  initialGames: Game[];
}

export default function GameClient({ initialGames }: GameClientProps) {
  return (
    <div className="min-h-screen bg-game-bg -mt-14 -mb-16 pb-16">
      {initialGames.map((game, index) => (
        <section
          key={game.id}
          id={game.id}
          className="relative min-h-screen flex flex-col"
        >
          {/* Hero Banner */}
          <div className="w-full h-[50vh] relative overflow-hidden">
            <Image
              src={game.backgroundImage}
              alt={game.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-linear-to-t from-game-bg via-transparent to-transparent" />
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6 lg:px-12">
              <h1
                className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-4"
                style={{
                  color: game.accentColor,
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                }}
              >
                {game.title}
              </h1>
              <div className="flex gap-4 flex-wrap">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-game-surface px-3 py-1 text-xs uppercase tracking-widest font-medium"
                    style={{ color: game.accentColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className={`flex-1 p-3 md:p-6 ${surfaceColors[index % 2]}`}>
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
              {/* Left Column - Content */}
              <div className="col-span-12 lg:col-span-8">
                <div className="space-y-8">
                  {/* Description Card */}
                  <div
                    className="p-6 md:p-8 rounded-xl border-l-2"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f2f0ec" : "#ffffff",
                      borderColor: game.accentColor,
                    }}
                  >
                    <p className="text-game-text/80 leading-relaxed text-base">
                      {game.description}
                    </p>
                  </div>

                  {/* Images or Icons Grid */}
                  {game.images.length > 0 ? (
                    <div
                      className={`grid gap-4 ${
                        game.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-1 md:grid-cols-3"
                      }`}
                    >
                      {game.images.map((img, i) => (
                        <div
                          key={i}
                          className="aspect-video bg-game-surface-alt overflow-hidden rounded-lg border border-game-text/5"
                        >
                          <Image
                            src={img}
                            alt={`${game.title} screenshot ${i + 1}`}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right Column - Metadata & Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* Metadata Card */}
                <div className="bg-game-surface p-6 rounded-xl">
                  <h4 className="text-[10px] text-game-muted uppercase tracking-[0.2em] mb-4">
                    元数据
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-game-text/10 pb-2">
                      <span className="text-xs uppercase font-bold text-game-muted">
                        中文名
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: game.accentColor }}
                      >
                        {game.chineseName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-game-text/10 pb-2">
                      <span className="text-xs uppercase font-bold text-game-muted">
                        英文名
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: game.accentColor }}
                      >
                        {game.englishName}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-game-text/10 pb-2">
                      <span className="text-xs uppercase font-bold text-game-muted">
                        开发商
                      </span>
                      <span className="text-xs font-bold text-game-text">
                        {game.developer}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-game-text/10 pb-2">
                      <span className="text-xs uppercase font-bold text-game-muted">
                        发行日期
                      </span>
                      <span className="text-xs font-bold text-game-text">
                        {game.released}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {game.officialUrl && (
                    <a
                      href={game.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 rounded-full font-bold text-sm tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: game.accentColor,
                        color: game.accentTextColor,
                      }}
                    >
                      {index === 1 ? (
                        <FlaskConical className="w-4 h-4" />
                      ) : index === 3 ? (
                        <Map className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      官网
                    </a>
                  )}
                  {game.wikiUrl && (
                    <a
                      href={game.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-4 rounded-full font-bold text-sm tracking-widest hover:bg-opacity-5 transition-all flex items-center justify-center gap-2 border"
                      style={{
                        borderColor: `${game.accentColor}33`,
                        color: game.accentColor,
                      }}
                    >
                      {index === 1 ? (
                        <BookOpen className="w-4 h-4" />
                      ) : index === 3 ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      维基百科
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
