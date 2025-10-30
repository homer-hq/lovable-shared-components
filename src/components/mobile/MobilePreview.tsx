import React, { useState } from 'react';
import { Header } from '@/components/mobile/Header';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { FABWithQuickActions } from '@/components/mobile/FABWithQuickActions';
import { QuickActionSlider } from '@/components/mobile/QuickActionSlider';
import { StartScreen } from '@/components/mobile/screens/StartScreen';
import { InventoryScreen } from '@/components/mobile/screens/InventoryScreen';
import { ExpensesScreen } from '@/components/mobile/screens/ExpensesScreen';
import { TimelineScreen } from '@/components/mobile/screens/TimelineScreen';
import { ListsScreen } from '@/components/mobile/screens/ListsScreen';
import { type TestContext, type AppliedEffectsState } from '@/utils/ruleEngine';

interface MobilePreviewProps {
  appliedEffects: {
    start: AppliedEffectsState;
    inventory: AppliedEffectsState;
    expenses: AppliedEffectsState;
    timeline: AppliedEffectsState;
    lists: AppliedEffectsState;
  };
  context: TestContext;
  onContextChange: (context: TestContext) => void;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({
  appliedEffects,
  context,
  onContextChange,
}) => {
  const [activeTab, setActiveTab] = useState<'start' | 'inventory' | 'expenses' | 'timeline' | 'lists'>('start');
  const [expensesSubtab, setExpensesSubtab] = useState<'expenses-all' | 'expenses-trackers'>(
    context.expensesScreen?.activeSubtab || 'expenses-all'
  );
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Get the current screen's applied effects
  const currentEffects = appliedEffects[activeTab];
  
  // Quick actions are always stored under the main tab key (not subtab)
  const currentQuickActions = currentEffects.quickActions[activeTab] || { items: [], layout: 'grid', showCustomize: false, showAllActions: false };

  // Sync expensesSubtab with context when context changes
  React.useEffect(() => {
    if (context.expensesScreen?.activeSubtab) {
      setExpensesSubtab(context.expensesScreen.activeSubtab);
    }
  }, [context.expensesScreen?.activeSubtab]);

  // Debug log for quick actions config
  React.useEffect(() => {
    const logKey = activeTab === 'expenses' ? `${activeTab}/${expensesSubtab}` : activeTab;
    console.log(`📱 Active: ${logKey} | QuickActions:`, currentQuickActions);
  }, [activeTab, expensesSubtab, currentQuickActions]);

  return (
    <div className="flex justify-center items-start py-6">
      {/* Phone frame */}
      <div className="relative w-[393px] h-[852px] bg-white rounded-[40px] shadow-2xl overflow-hidden border-[8px] border-gray-900">
        {/* Scrollable content area - includes header and content */}
        <div className="absolute inset-0 overflow-y-auto bg-background">

          {/* Header - only show on start screen */}
          {activeTab === 'start' && (
            <Header
              homeName={context.home.name || 'My Home'}
              homeImageUrl="https://www.byggahus.se/sites/default/files/hustillverkare/nordiska-villor-villa-gotland.webp"
              partnerLogoUrl={currentEffects.homeImage.partnerLogo}
              display={currentEffects.header}
              navDotCount={currentEffects.header.navDotCount}
              activeNavDot={currentEffects.header.activeNavDot}
            />
          )}

          {/* Screen-specific content */}
          {activeTab === 'start' && <StartScreen appliedEffects={currentEffects} />}
          {activeTab === 'inventory' && <InventoryScreen appliedEffects={currentEffects} />}
          {activeTab === 'expenses' && (
            <ExpensesScreen 
              appliedEffects={currentEffects} 
              activeSubtab={expensesSubtab}
              onSubtabChange={(subtab) => {
                setExpensesSubtab(subtab);
                onContextChange({
                  ...context,
                  expensesScreen: { activeSubtab: subtab }
                });
              }}
            />
          )}
          {activeTab === 'timeline' && <TimelineScreen appliedEffects={currentEffects} />}
          {activeTab === 'lists' && <ListsScreen appliedEffects={currentEffects} />}
        </div>

        {/* FAB with Quick Actions - only on start screen */}
        {activeTab === 'start' ? (
          <>
            <div className="absolute bottom-[16px] right-[4px] z-30">
              <FABWithQuickActions
                actionIds={currentQuickActions.items}
                layout={currentQuickActions.layout}
                visible={currentEffects.fab.visible}
                showCustomizeButton={currentQuickActions.showCustomize}
                showAllActionsButton={currentQuickActions.showAllActions}
                onCustomizeClick={() => console.log('Customize quick actions for', activeTab)}
                onAllActionsClick={() => console.log('Show all actions for', activeTab)}
              />
            </div>
            {/* Clickable hotspot above tab bar */}
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="absolute bottom-24 right-6 w-14 h-14 z-50 cursor-pointer bg-transparent"
              aria-label="Open quick actions"
            />
            <QuickActionSlider
              visible={showQuickActions && (currentQuickActions.items.length > 0 || currentQuickActions.showAllActions || currentQuickActions.showCustomize)}
              onClose={() => setShowQuickActions(false)}
              actionIds={currentQuickActions.items}
              layout={currentQuickActions.layout}
              showCustomizeButton={currentQuickActions.showCustomize}
              showAllActionsButton={currentQuickActions.showAllActions}
              onCustomizeClick={() => console.log('Customize quick actions for', activeTab)}
              onAllActionsClick={() => console.log('Show all actions for', activeTab)}
            />
          </>
        ) : (
          /* For screenshot tabs, clickable hotspot over the FAB in screenshot */
          <>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="absolute bottom-24 right-6 w-14 h-14 z-50 cursor-pointer bg-transparent"
              aria-label="Open quick actions"
            />
            <QuickActionSlider
              visible={showQuickActions && (currentQuickActions.items.length > 0 || currentQuickActions.showAllActions || currentQuickActions.showCustomize)}
              onClose={() => setShowQuickActions(false)}
              actionIds={currentQuickActions.items}
              layout={currentQuickActions.layout}
              showCustomizeButton={false}
              showAllActionsButton={currentQuickActions.showAllActions}
              onCustomizeClick={() => console.log('Customize quick actions for', activeTab)}
              onAllActionsClick={() => console.log('Show all actions for', activeTab)}
            />
          </>
        )}

        {/* Covering rectangle for screenshot tab bars - only show on screenshot tabs */}
        {activeTab !== 'start' && (
          <div className="absolute bottom-0 left-0 right-0 h-[104px] bg-background z-35" />
        )}

        {/* Fixed Bottom tab bar */}
        {currentEffects.bottomTabs.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-40">
            <BottomTabBar 
              tabs={currentEffects.bottomTabs} 
              activeTab={activeTab}
              onTabClick={(tabId) => setActiveTab(tabId as typeof activeTab)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
