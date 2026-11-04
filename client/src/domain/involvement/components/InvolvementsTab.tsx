import { Fragment } from 'react';
import { App, Button, Row, Table, type TableColumnsType, Tag, Typography, Popconfirm } from 'antd';
import { Show } from '@domain/@shared/Show';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { InvolvementsContextProvider } from '../Involvements.context';
import { INVOLVEMENT_TYPE_COLORS, INVOLVEMENT_TYPE_LABELS, type Involvement } from '../involvement.type';
import { CreateInvolvementModal } from './CreateInvolvementModal';
import { deleteInvolvement } from '../api/delete-involvement.service';

export function InvolvementsTab({ recordId }: { recordId: number }) {
    const app = App.useApp();

    return (
        <InvolvementsContextProvider recordId={recordId}>
            {({ isLoading, involvements, isAnonymous, setIsCreateModalVisible, isCreateModalVisible, fetchInvolvements }) => {

                const handleDelete = async (id: number) => {
                    const response = await deleteInvolvement(recordId, id);
                    if (hasServiceError(response)) return handleServiceError(app, response);
                    fetchInvolvements(recordId);
                };

                const COLUMNS: TableColumnsType<Involvement.Model> = [
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
                        ),
                    },
                    {
                        title: 'Ações',
                        key: 'actions',
                        render: (_, record) => (
                            <Popconfirm title="Remover vínculo?" onConfirm={() => handleDelete(record.id)}>
                                <Button danger type="text">Excluir</Button>
                            </Popconfirm>
                        ),
                    },
                ];

                return (
                    <Fragment>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Typography.Title level={4} style={{ margin: 0 }}>
                                Envolvidos
                                <Tag color={isLoading ? 'default' : (isAnonymous ? 'grey' : '#1677ff')} style={{ marginLeft: 12 }}>
                                    {isLoading ? 'Carregando...' : (isAnonymous ? 'Relatante Anônimo' : 'Relatante Identificado')}
                                </Tag>
                            </Typography.Title>
                            <Button type="primary" onClick={() => setIsCreateModalVisible(true)}>
                                Vincular Pessoa
                            </Button>
                        </Row>

                        <Table columns={COLUMNS} dataSource={involvements} rowKey="id" loading={isLoading} />

                        <Show when={isCreateModalVisible}>
                            <CreateInvolvementModal recordId={recordId} />
                        </Show>
                    </Fragment>
                );
            }}
        </InvolvementsContextProvider>
    );
}