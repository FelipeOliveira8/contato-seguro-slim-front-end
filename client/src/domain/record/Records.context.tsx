import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { App } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { UnknownContextError } from '@domain/@shared/unknown-context-error';

import { listRecords } from './api/list-records.service';
import type { Record } from './record.type';

import { listInvolvements } from '@domain/involvement/api/list-involvements.service';

type Value = {
    records: Record.Model[];
    record: Record.Model | null;
    recordId: Record.Model['id'] | null;
    setRecordId: Dispatch<SetStateAction<Value['recordId']>>;
    isLoading: boolean;
    isCreateModalVisible: boolean;
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>;
    isEditModalVisible: boolean;
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>;
    fetchRecords: () => Promise<void>;
};

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const RecordsContext = createContext<Value | null>(null);

/** @see https://www.youtube.com/watch?v=I7dwJxGuGYQ */
export function RecordsContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [records, setRecords] = useState<Value['records']>([]);
    const [recordId, setRecordId] = useState<Record.Model['id'] | null>(null);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    const app = App.useApp();

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);

        const response = await listRecords();

        if (hasServiceError(response)) {
            setIsLoading(false);
            return handleServiceError(app, response);
        }

        const recordsWithInvolvements = await Promise.all(
            response.data.records.map(async (record) => {
                const invResponse = await listInvolvements(record.id);

                if (hasServiceError(invResponse)) {
                    return { ...record, involvements: [], is_anonymous: false };
                }

                return {
                    ...record,
                    involvements: invResponse.data.involvements,
                    is_anonymous: invResponse.data.is_anonymous,
                };
            })
        );

        setRecords(recordsWithInvolvements);
        setIsLoading(false);
    }, [app]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const record = useMemo(() => {
        if (!recordId) return null;

        const found = records.find(r => r.id === recordId);

        if (!found)
            throw new Error(`Could not find a record with id ${recordId}`);

        return found;
    }, [records, recordId]);

    const value: Value = {
        isLoading,
        records,
        record,
        recordId,
        setRecordId,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        fetchRecords,
    };

    return (
        <RecordsContext.Provider value={value}>
            {children(value)}
        </RecordsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecordsContext() {
    const context = useContext(RecordsContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}
