import { Fragment, useState } from 'react';

import { Button, Row, type TableColumnsType, Typography, Tag, Modal, Table as AntTable } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CompaniesContextProvider } from '@domain/company/Companies.context';
import { CreateRecordModal } from '@domain/record/components/CreateRecordModal';
import { EditRecordModal } from '@domain/record/components/EditRecordModal';
import { RecordsActionsCell } from '@domain/record/components/RecordsActionsCell';
import type { Record } from '@domain/record/record.type';
import { RecordsContextProvider } from '@domain/record/Records.context';

import { INVOLVEMENT_TYPE_COLORS, INVOLVEMENT_TYPE_LABELS, type Involvement } from '@domain/involvement/involvement.type';

const STATUS_LABELS: Record<Record.Status, string> = {
    awaiting_investigation: 'Aguardando investigação',
    investigation_in_progress: 'Investigação em andamento',
    resolved: 'Resolvido',
    archived: 'Arquivado',
};

const INVOLVEMENTS_COLUMNS: TableColumnsType<Involvement.Model> = [
    {
        title: 'Nome',
        dataIndex: ['person', 'name']
    },
    {
        title: 'CPF',
        dataIndex: ['person', 'cpf'],
        render: (value: string) => value?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '-'
    },
    {
        title: 'Papel',
        dataIndex: 'type',
        render: (type: Involvement.Type) => (
            <Tag color={INVOLVEMENT_TYPE_COLORS[type]}>
                {INVOLVEMENT_TYPE_LABELS[type]}
            </Tag>
        )
    },
];

export function Records() {

    const [viewInvolvementsRecord, setViewInvolvementsRecord] = useState<Record.Model | null>(null);

    const COLUMNS: TableColumnsType<Record.Model> = [
        {
            title: 'ID',
            dataIndex: 'id',
            render: value => `#${value}`,
        },
        {
            title: 'Título',
            dataIndex: 'title',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: value => STATUS_LABELS[value as Record.Status] ?? value,
        },
        {
            title: 'Relatante',
            dataIndex: 'is_anonymous',
            render: (is_anonymous?: boolean) => (
                <Tag color={is_anonymous ? 'grey' : '#1677ff'}>
                    {is_anonymous ? 'Anônimo' : 'Identificado'}
                </Tag>
            ),
        },
        {
            title: 'Envolvidos',
            key: 'involvements',
            render: (_, record) => (
                <Button
                    type="dashed"
                    onClick={() => setViewInvolvementsRecord(record)}
                >
                    Lista de envolvidos ({record.involvements?.length || 0})
                </Button>
            ),
        },
        {
            render: (_, record) => <RecordsActionsCell record={record} />,
        },
    ];

    return (
        <CompaniesContextProvider>
            {() => (
                <RecordsContextProvider>
                    {({
                        isLoading,
                        records,
                        setIsCreateModalVisible,
                        isCreateModalVisible,
                        isEditModalVisible,
                        record
                    }) => (
                        <Fragment>
                            <main>
                                <Row justify="space-between" align="middle">
                                    <Typography.Title level={3}>
                                        Relatos
                                    </Typography.Title>

                                    <Button
                                        type="primary"
                                        onClick={() => setIsCreateModalVisible(true)}
                                    >
                                        Cadastrar
                                    </Button>
                                </Row>

                                <Table
                                    columns={COLUMNS}
                                    dataSource={records}
                                    loading={isLoading}
                                />
                            </main>

                            <Show when={isCreateModalVisible}>
                                <CreateRecordModal />
                            </Show>

                            <Show when={isEditModalVisible && !!record}>
                                <EditRecordModal />
                            </Show>

                            <Modal
                                open={!!viewInvolvementsRecord}
                                title={`Envolvidos no Relato #${viewInvolvementsRecord?.id}`}
                                onCancel={() => setViewInvolvementsRecord(null)}
                                footer={null}
                                destroyOnClose
                            >
                                <AntTable
                                    columns={INVOLVEMENTS_COLUMNS}
                                    dataSource={viewInvolvementsRecord?.involvements || []}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                />
                            </Modal>
                        </Fragment>
                    )}
                </RecordsContextProvider>
            )}
        </CompaniesContextProvider>
    );
}
