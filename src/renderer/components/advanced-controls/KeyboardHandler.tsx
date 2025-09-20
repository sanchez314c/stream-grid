import React, { useEffect } from 'react';
import { useStreamGridStore } from '../../store';

interface KeyboardHandlerProps {
  children: React.ReactNode;
}

export const KeyboardHandler: React.FC<KeyboardHandlerProps> = ({ children }) => {
  const {
    streams,
    advancedControls,
    selectedStreamId,
    startRecording,
    stopRecording,
    toggleVFXFilter,
    startRandomizer,
    stopRandomizer,
    triggerRandomization,
    setSelectedStreamId
  } = useStreamGridStore();

  // For now, use default keyboard settings since settings system isn't fully integrated
  const keyboardSettings = {
    enabled: true,
    requireModifierKey: false,
    showHints: true,
    shortcuts: {
      randomizeStreams: 'ArrowRight',
      reloadStreams: 'ArrowLeft', 
      pausePlayback: 'Space',
      stopStreams: 'ArrowDown',
      toggleRecording: 'KeyR',
      toggleVFX: 'KeyV',
      streamSelection: true,
      streamNavigation: true
    }
  };
  
  const isEnabled = keyboardSettings.enabled && advancedControls.enabled;

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      )) {
        return;
      }

      // Check for modifier key requirements
      const requiresModifier = keyboardSettings.requireModifierKey;
      const modifierPressed = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;

      if (requiresModifier && !modifierPressed) {
        return;
      }

      // Handle keyboard shortcuts
      switch (event.code) {
        case keyboardSettings.shortcuts.randomizeStreams:
          event.preventDefault();
          if (advancedControls.randomizerActive) {
            triggerRandomization();
          } else {
            startRandomizer(15); // Start with 15 second interval
          }
          break;

        case keyboardSettings.shortcuts.reloadStreams:
          event.preventDefault();
          // Reload all streams by triggering a page refresh for now
          // This functionality would need to be implemented in the main process
          console.log('Reload streams requested');
          break;

        case keyboardSettings.shortcuts.pausePlayback:
          event.preventDefault();
          // Pause/play functionality would need to be implemented
          console.log('Pause/play streams requested');
          break;

        case keyboardSettings.shortcuts.stopStreams:
          event.preventDefault();
          // Stop randomizer if active
          if (advancedControls.randomizerActive) {
            stopRandomizer();
          }
          break;

        case keyboardSettings.shortcuts.toggleRecording:
          event.preventDefault();
          // Toggle recording for selected stream
          if (selectedStreamId) {
            // Fix for Immer proxy issue with Maps
            const recordingStateMap = advancedControls.recordingState;
            const recordingState = recordingStateMap instanceof Map 
              ? recordingStateMap.get(selectedStreamId)
              : Array.from(recordingStateMap || []).find(([key]) => key === selectedStreamId)?.[1];
            if (recordingState?.isRecording) {
              stopRecording(selectedStreamId);
            } else {
              startRecording(selectedStreamId);
            }
          } else {
            // Toggle recording for all streams
            const streamIds = Array.from(streams.keys());
            for (const streamId of streamIds) {
              // Fix for Immer proxy issue with Maps
              const recordingStateMap = advancedControls.recordingState;
              const recordingState = recordingStateMap instanceof Map 
                ? recordingStateMap.get(streamId)
                : Array.from(recordingStateMap || []).find(([key]) => key === streamId)?.[1];
              if (recordingState?.isRecording) {
                stopRecording(streamId);
              } else {
                startRecording(streamId);
              }
            }
          }
          break;

        case keyboardSettings.shortcuts.toggleVFX:
          event.preventDefault();
          // Toggle VFX for selected stream
          if (selectedStreamId) {
            const vfxState = advancedControls.vfxFilters.get(selectedStreamId);
            if (vfxState && vfxState.activeFilters.length > 0) {
              // Toggle first filter or add a default one
              const firstFilter = vfxState.activeFilters[0];
              if (firstFilter) {
                toggleVFXFilter(selectedStreamId, firstFilter.id);
              }
            } else {
              // Add default VFX filter
              toggleVFXFilter(selectedStreamId, 'vhs');
            }
          }
          break;

        // Numeric keys for stream selection (1-9)
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
          if (keyboardSettings.shortcuts.streamSelection) {
            event.preventDefault();
            const streamIndex = parseInt(event.code.replace('Digit', '')) - 1;
            const streamIds = Array.from(streams.keys());
            if (streamIndex < streamIds.length) {
              const streamId = streamIds[streamIndex];
              setSelectedStreamId(streamId);
            }
          }
          break;

        // Arrow keys for stream navigation
        case 'ArrowLeft':
          if (keyboardSettings.shortcuts.streamNavigation) {
            event.preventDefault();
            navigateToStream('previous');
          }
          break;

        case 'ArrowRight':
          if (keyboardSettings.shortcuts.streamNavigation) {
            event.preventDefault();
            navigateToStream('next');
          }
          break;

        case 'ArrowUp':
          if (keyboardSettings.shortcuts.streamNavigation) {
            event.preventDefault();
            navigateToStream('up');
          }
          break;

        case 'ArrowDown':
          if (keyboardSettings.shortcuts.streamNavigation) {
            event.preventDefault();
            navigateToStream('down');
          }
          break;

        // Escape key to clear selection
        case 'Escape':
          event.preventDefault();
          setSelectedStreamId(null);
          break;

        default:
          break;
      }
    };

    const navigateToStream = (direction: 'previous' | 'next' | 'up' | 'down') => {
      const streamIds = Array.from(streams.keys());
      const currentIndex = selectedStreamId ? streamIds.indexOf(selectedStreamId) : -1;

      let newIndex = 0;

      switch (direction) {
        case 'previous':
          newIndex = currentIndex > 0 ? currentIndex - 1 : streamIds.length - 1;
          break;
        case 'next':
          newIndex = currentIndex < streamIds.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'up':
          // Navigate up in grid (implementation depends on grid layout)
          newIndex = currentIndex - 2; // Assuming 2-column grid
          if (newIndex < 0) newIndex = streamIds.length + newIndex;
          break;
        case 'down':
          // Navigate down in grid (implementation depends on grid layout)
          newIndex = (currentIndex + 2) % streamIds.length; // Assuming 2-column grid
          break;
      }

      if (streamIds[newIndex]) {
        setSelectedStreamId(streamIds[newIndex]);
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isEnabled,
    keyboardSettings,
    streams,
    selectedStreamId,
    advancedControls.randomizerActive,
    advancedControls.vfxFilters,
    advancedControls.recordingState
  ]);

  // Show keyboard shortcut hints overlay
  const showHints = keyboardSettings.showHints && isEnabled;

  return (
    <div className="relative">
      {children}
      
      {/* Keyboard Hints Overlay */}
      {showHints && (
        <div className="fixed bottom-4 right-4 bg-gray-900/95 text-white p-4 rounded-lg border border-gray-600 backdrop-blur-sm z-50 max-w-sm">
          <h4 className="font-semibold mb-2">Keyboard Shortcuts</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">Right Arrow:</span>
              <span>Randomize</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Left Arrow:</span>
              <span>Reload</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Space:</span>
              <span>Pause</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Down Arrow:</span>
              <span>Stop</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">R:</span>
              <span>Record</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">V:</span>
              <span>Toggle VFX</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">1-9:</span>
              <span>Select Stream</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Esc:</span>
              <span>Clear Selection</span>
            </div>
          </div>
          {keyboardSettings.requireModifierKey && (
            <div className="mt-2 text-xs text-gray-400">
              * Requires modifier key (Ctrl/Cmd/Alt/Shift)
            </div>
          )}
        </div>
      )}

      {/* Selected Stream Indicator */}
      {selectedStreamId && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-50">
          <div className="text-sm font-medium">
            Selected: Stream {Array.from(streams.keys()).indexOf(selectedStreamId) + 1}
          </div>
        </div>
      )}
    </div>
  );
};