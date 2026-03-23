import { createContext, useContext } from 'react';
import useSocket from '../hooks/useSocket';
import useBoardState from '../hooks/useBoard'; // rename the import
import usePresence from '../hooks/usePresence';

const BoardContext = createContext(null);

export const BoardProvider = ({ boardId, children }) => {
  const socketRef = useSocket();
  const { state, dispatch, moveCard, createCard, updateCard, deleteCard, createColumn } =
    useBoardState(boardId, socketRef); // use renamed import
  const { onlineUsers, cursors } = usePresence(socketRef, boardId);

  return (
    <BoardContext.Provider
      value={{
        state,
        dispatch,
        onlineUsers,
        cursors,
        socketRef,
        moveCard,
        createCard,
        updateCard,
        deleteCard,
        createColumn,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

// This is the hook components use — no conflict now
export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};