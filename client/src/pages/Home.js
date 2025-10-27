import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Palette, Users, Zap, Code, Trophy } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Home = () => {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Visual Scripting',
      description: 'Build game logic with intuitive node-based editor. No coding required!',
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'Asset Marketplace',
      description: 'Buy and sell game assets as NFTs. Build your creative inventory.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Multiplayer Ready',
      description: 'Create real-time multiplayer games with built-in networking.',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Live Spectating',
      description: 'Watch games live with Twitch-like chat and interactions.',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Procedural Levels',
      description: 'AI generates dynamic levels based on player skill and preferences.',
    },
    {
      icon: <Gamepad2 className="w-8 h-8" />,
      title: 'Cross-Game Items',
      description: 'Use your items across different games in the ecosystem.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-slate-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 animate-fade-in bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Build Your Dream Game
              <span className="block mt-2">
                In Your Browser
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Create, play, and share multiplayer games with our powerful browser-based game
              engine. No downloads, no installations, just pure creativity!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Creating Free
                </Button>
              </Link>
              <Link to="/games">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Browse Games
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">1000+</div>
              <div className="text-slate-300">Games Created</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-pink-400 mb-2">5000+</div>
              <div className="text-slate-300">Active Players</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-indigo-400 mb-2">500+</div>
              <div className="text-slate-300">Assets Available</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-400">Everything you need to create amazing games</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="p-6">
                <div className="text-purple-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Create Your Game</h3>
              <p className="text-slate-400">
                Use our visual editor to design your game logic without writing code
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Add Assets</h3>
              <p className="text-slate-400">
                Browse our marketplace and add stunning assets to your game
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Publish & Play</h3>
              <p className="text-slate-400">
                Share your game with the world and let players enjoy your creation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Creating?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of game creators and start building your dream game today!
          </p>
          <Link to="/register">
            <Button size="lg" className="px-12">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;