import { Fragment } from 'react';

import { Button, Row, type TableColumnsType, Typography } from 'antd';

import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { PeopleContextProvider } from '@domain/person/People.context';
import type { Person } from '@domain/person/person.type';
import { PeopleActionsCell } from '@domain/person/components/PeopleActionsCell';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';

const COLUMNS: TableColumnsType<Person.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {
        title: 'CPF',
        dataIndex: 'cpf',
        render: (value: string) => value?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') || '-'
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Data de Nascimento',
        dataIndex: 'birth_date',
        render: (value: string) => {
            if (!value) return '-';
            const [year, month, day] = value.split('-');
            return `${day}/${month}/${year}`;
        }
    },
    {
        render: (_, record) => <PeopleActionsCell person={record} />,
    },
];

export function People() {
    return (
        <PeopleContextProvider>
            {({
                isLoading,
                people,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Pessoas
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
                            dataSource={people}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreatePersonModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditPersonModal />
                    </Show>
                </Fragment>
            )}
        </PeopleContextProvider>
    );
}
