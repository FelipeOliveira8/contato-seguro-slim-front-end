import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { App } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { UnknownContextError } from '@domain/@shared/unknown-context-error';

import { listInvolvements } from './api/list-involvements.service';
import type { Involvement } from './involvement.type';

type Value = {
    involvements: Involvement.Model[];
    isAnonymous: boolean;
    isLoading: boolean;
    isCreateModalVisible: boolean;
    setIsCreateModalVisible: Dispatch<SetStateAction<boolean>>;
    fetchInvolvements: (recordId: number) => Promise<void>;
};

type Props = { children: (value: Value) => ReactNode; recordId: number };

export const InvolvementsContext = createContext<Value | null>(null);

export function InvolvementsContextProvider({ children, recordId }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [involvements, setInvolvements] = useState<Involvement.Model[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const app = App.useApp();

    const fetchInvolvements = useCallback(async (id: number) => {
        setIsLoading(true);
        const response = await listInvolvements(id);
        setIsLoading(false);

        if (hasServiceError(response)) return handleServiceError(app, response);

        setInvolvements(response.data.involvements);
        setIsAnonymous(response.data.is_anonymous);
    }, [app]);

    useEffect(() => {
        if (recordId) fetchInvolvements(recordId);
    }, [recordId, fetchInvolvements]);

    const value: Value = {
        involvements,
        isAnonymous,
        isLoading,
        isCreateModalVisible,
        setIsCreateModalVisible,
        fetchInvolvements,
    };

    return (
        <InvolvementsContext.Provider value={value}>
            {children(value)}
        </InvolvementsContext.Provider>
    );
}

export function useInvolvementsContext() {
    const context = useContext(InvolvementsContext);
    if (!context) throw new UnknownContextError();
    return context;
}