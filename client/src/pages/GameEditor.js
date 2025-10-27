import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';

const GameEditor = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Game Editor {id ? `- Editing Game ${id}` : '- New Game'}
          </h1>
          <p className="text-slate-400 text-lg mb-6">
            Visual scripting editor coming soon! This will feature a node-based game logic editor.
          </p>
          <div className="text-slate-500">
            <p>Features to be implemented:</p>
            <ul className="mt-4 space-y-2 text-left max-w-md mx-auto">
              <li>✓ Node-based visual scripting</li>
              <li>✓ Drag-and-drop game logic</li>
              <li>✓ Real-time preview</li>
              <li>✓ Asset integration</li>
              <li>✓ Physics configuration</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameEditor;