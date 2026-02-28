import React, { useState } from 'react';
import { MainMenu } from './views/MainMenu';
import { TalentSelect } from './components/TalentSelect';
import { StatAlloc } from './components/StatAlloc';
import { Codex } from './views/Codex';
import { ReincarnationHall } from './views/ReincarnationHall';
import { CharacterSheet } from './views/CharacterSheet';
import { GameScene } from './views/GameScene';
import { useUIStore } from './store/uiStore';
import './App.css';

// 惰性加载编辑器
const EditorLayout = React.lazy(() => import('./editor/EditorLayout').then(m => ({ default: m.EditorLayout })));

function App() {
  // UI Store
  const scene = useUIStore(s => s.scene);
  const showCharacterSheet = useUIStore(s => s.showCharacterSheet);

  // 编辑器模式切换
  const [isEditorMode, setIsEditorMode] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setIsEditorMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isEditorMode) {
    return (
      <React.Suspense fallback={<div className="text-jade font-mono p-4">加载编辑器...</div>}>
        <EditorLayout />
      </React.Suspense>
    );
  }

  const renderScene = () => {
    switch (scene) {
      case 'MENU': return <MainMenu />;
      case 'TALENT': return <TalentSelect />;
      case 'ALLOC': return <StatAlloc />;
      case 'GAME': return <GameScene />;
      case 'CODEX': return <Codex />;
      case 'REINCARNATION': return <ReincarnationHall />;
      default: return <MainMenu />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* 角色面板模态框 - 全局覆盖 */}
      {showCharacterSheet && <CharacterSheet />}

      {/* 场景渲染 */}
      {renderScene()}
    </div>
  );
}

export default App;
