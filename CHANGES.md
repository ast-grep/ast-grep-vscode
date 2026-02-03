# Changes Made for Input Focus Fix

## Issue
When invoking the command `ast-grep: Focus on Structural Search View` (command ID: `ast-grep.search.input.focus`) from the command palette or via a keybinding, the view became visible but the search input was not focused, making it impossible to immediately start typing a search query.

## Solution
Added functionality to automatically focus the search input when the view becomes visible:

1. **Added new message type** (`focusSearchInput`) in `src/types.ts` to enable communication from the extension to the webview
2. **Enhanced SearchInput component** (`src/webview/SearchSidebar/SearchWidgetContainer/SearchInput.tsx`):
   - Made it a forwardRef component
   - Added `SearchInputHandle` interface with a `focus()` method
   - Implemented `useImperativeHandle` to expose the focus functionality
   - Added refs for both single-line and multi-line inputs
   - Handle shadow DOM access for VSCode UI Toolkit components

3. **Updated SearchWidget** (`src/webview/SearchSidebar/SearchWidgetContainer/SearchWidget.tsx`):
   - Added a ref to the SearchInput component
   - Registered a message handler for `focusSearchInput` that calls the focus method

4. **Updated extension** (`src/extension/webview.ts`):
   - Added `onDidChangeVisibility` listener in `resolveWebviewView`
   - Sends `focusSearchInput` message when the view becomes visible

## Testing
To test this fix:
1. Open VSCode with this extension installed
2. Press Ctrl+Shift+P and type "ast-grep: Focus on Structural Search View"
3. The view should open AND the search input should be automatically focused
4. You should be able to immediately start typing without clicking on the input field

This behavior now matches the user's expectation and mimics the behavior of VSCode's built-in search (Ctrl+Shift+F).
