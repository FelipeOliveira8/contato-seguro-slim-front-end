import { useState } from 'react';

import { App, Button, Popconfirm, Space } from 'antd';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { listRecords } from '@domain/record/api/list-records.service';
import { listInvolvements } from '@domain/involvement/api/list-involvements.service';

import { deletePerson } from '../api/delete-person.service';
import { usePeopleContext } from '../People.context';
import type { Person } from '../person.type';

type Props = { person: Person.Model };

export function PeopleActionsCell({ person }: Props) {
    const [isPopconfirmVisible, setIsPopconfirmVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [confirmDescription, setConfirmDescription] = useState('Tem certeza que deseja excluir a pessoa?');

    const { setPersonId, setIsEditModalVisible, fetchPeople } = usePeopleContext();

    const app = App.useApp();

    const handleEdit = () => {
        setPersonId(person.id);
        setIsEditModalVisible(true);
    };

    const handleCheckInvolvements = async () => {
        setIsChecking(true);
        let hasInvolvements = false;

        const recordsResponse = await listRecords();

        if (!hasServiceError(recordsResponse)) {
            const records = recordsResponse.data.records;

            const involvementsResponses = await Promise.all(
                records.map(record => listInvolvements(record.id))
            );

            hasInvolvements = involvementsResponses.some(res => {
                if (hasServiceError(res)) return false;
                return res.data.involvements.some(inv => inv.person_id === person.id);
            });
        }

        if (hasInvolvements) {
            setConfirmDescription('Esta pessoa está vinculada a um ou mais relatos. Sua exclusão irá impactar na consistência dos dados. Tem certeza que deseja prosseguir com a exclusão?');
        } else {
            setConfirmDescription('Tem certeza que deseja excluir a pessoa?');
        }

        setIsChecking(false);
        setIsPopconfirmVisible(true);
    };

    const handleDelete = async () => {
        setIsSending(true);

        const response = await deletePerson(person.id);

        await sleep(1000);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        setIsSending(false);
        setIsPopconfirmVisible(false);
        fetchPeople();
    };

    return (
        <Space size="middle">
            <Button
                type="text"
                icon={<EditOutlined />}
                title="Editar"
                onClick={handleEdit}
            />

            <Popconfirm
                title="Excluir pessoa"
                description={confirmDescription}
                open={isPopconfirmVisible}
                placement="left"
                cancelText="Não"
                okText="Sim"
                okType="danger"
                okButtonProps={{ loading: isSending }}
                onConfirm={handleDelete}
                onCancel={() => setIsPopconfirmVisible(false)}
            >
                <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Excluir"
                    loading={isChecking}
                    onClick={handleCheckInvolvements}
                />
            </Popconfirm>
        </Space>
    );
}
