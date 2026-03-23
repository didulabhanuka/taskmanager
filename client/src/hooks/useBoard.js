import { useEffect, useReducer, useCallback } from 'react';
import * as boardsApi from '../api/boards.api';
import * as activitiesApi from '../api/activities.api';

const initialState = {
  board: null,
  // Normalised maps for O(1) lookups
  columns: {},
  cards: {},
  activities: [],
  loading: true,
  error: null,
};

const boardReducer = (state, action) => {
  switch (action.type) {
    case 'BOARD_LOADED': {
      const { board, columns, cards } = action.payload;

      // Convert arrays to maps keyed by _id
      const columnsMap = columns.reduce((acc, col) => {
        acc[col._id] = col;
        return acc;
      }, {});

      const cardsMap = cards.reduce((acc, card) => {
        acc[card._id] = card;
        return acc;
      }, {});

      return {
        ...state,
        board,
        columns: columnsMap,
        cards: cardsMap,
        loading: false,
      };
    }

    case 'ACTIVITIES_LOADED':
      return { ...state, activities: action.payload };

    case 'ACTIVITY_ADDED':
      // Prepend new activity, cap at 100
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 100),
      };

    case 'CARD_CREATED':
      return {
        ...state,
        cards: { ...state.cards, [action.payload._id]: action.payload },
      };

    case 'CARD_UPDATED':
      return {
        ...state,
        cards: { ...state.cards, [action.payload._id]: action.payload },
      };

    case 'CARD_DELETED': {
      const cards = { ...state.cards };
      delete cards[action.payload];
      return { ...state, cards };
    }

    case 'CARD_MOVED':
      return {
        ...state,
        cards: { ...state.cards, [action.payload._id]: action.payload },
      };

    // Optimistic update — move card instantly before server confirms
    case 'CARD_MOVED_OPTIMISTIC': {
      const { cardId, toColumnId, newOrder } = action.payload;
      const card = state.cards[cardId];
      if (!card) return state;
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: { ...card, columnId: toColumnId, order: newOrder },
        },
      };
    }

    case 'COLUMN_CREATED':
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload._id]: action.payload,
        },
      };

    case 'COLUMN_UPDATED':
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload._id]: action.payload,
        },
      };

    case 'COLUMN_DELETED': {
      const columns = { ...state.columns };
      delete columns[action.payload];
      // Also remove all cards in that column
      const cards = Object.fromEntries(
        Object.entries(state.cards).filter(
          ([, card]) => card.columnId !== action.payload
        )
      );
      return { ...state, columns, cards };
    }

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

const useBoard = (boardId, socketRef) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  // Load initial board data via REST
  useEffect(() => {
    if (!boardId) return;

    const loadBoard = async () => {
      try {
        const [boardRes, activitiesRes] = await Promise.all([
          boardsApi.getBoardById(boardId),
          activitiesApi.getActivities(boardId, { limit: 50, skip: 0 }),
        ]);

        dispatch({ type: 'BOARD_LOADED', payload: boardRes.data.data });
        dispatch({
          type: 'ACTIVITIES_LOADED',
          payload: activitiesRes.data.data.activities,
        });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    };

    loadBoard();
  }, [boardId]);

  // Register socket listeners and join board room
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !boardId) return;

    socket.emit('board:join', { boardId });

    socket.on('card:created', ({ card }) =>
      dispatch({ type: 'CARD_CREATED', payload: card })
    );

    socket.on('card:updated', ({ card }) =>
      dispatch({ type: 'CARD_UPDATED', payload: card })
    );

    socket.on('card:deleted', ({ cardId }) =>
      dispatch({ type: 'CARD_DELETED', payload: cardId })
    );

    socket.on('card:moved', ({ card }) =>
      dispatch({ type: 'CARD_MOVED', payload: card })
    );

    socket.on('column:created', ({ column }) =>
      dispatch({ type: 'COLUMN_CREATED', payload: column })
    );

    socket.on('activity:new', ({ activity }) =>
      dispatch({ type: 'ACTIVITY_ADDED', payload: activity })
    );

    return () => {
      socket.emit('board:leave', { boardId });
      socket.off('card:created');
      socket.off('card:updated');
      socket.off('card:deleted');
      socket.off('card:moved');
      socket.off('column:created');
      socket.off('activity:new');
    };
  }, [socketRef, boardId]);

  // Optimistic card move — updates UI instantly then emits to server
  const moveCard = useCallback(
    (cardId, toColumnId, newOrder) => {
      dispatch({
        type: 'CARD_MOVED_OPTIMISTIC',
        payload: { cardId, toColumnId, newOrder },
      });
      socketRef.current?.emit('card:move', { cardId, toColumnId, newOrder });
    },
    [socketRef]
  );

  const createCard = useCallback(
    (title, columnId, boardId) => {
      socketRef.current?.emit('card:create', { title, columnId, boardId });
    },
    [socketRef]
  );

  const updateCard = useCallback(
    (cardId, updates) => {
      socketRef.current?.emit('card:update', { cardId, updates });
    },
    [socketRef]
  );

  const deleteCard = useCallback(
    (cardId) => {
      socketRef.current?.emit('card:delete', { cardId });
    },
    [socketRef]
  );

  const createColumn = useCallback(
    (title, boardId) => {
      socketRef.current?.emit('column:create', { title, boardId });
    },
    [socketRef]
  );

  return {
    state,
    dispatch,
    moveCard,
    createCard,
    updateCard,
    deleteCard,
    createColumn,
  };
};

export default useBoard;