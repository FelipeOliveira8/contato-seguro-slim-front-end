import { useEffect, useState } from 'react';
import { App, Divider, Form, Modal, Select } from 'antd';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';
import { createInvolvement } from '../api/create-involvement.service';
import { useInvolvementsContext } from '../Involvements.context';
import { INVOLVEMENT_TYPE_LABELS, type Involvement } from '../involvement.type';
import { listPeople } from '@domain/person/api/list-people.service'; // Ajuste o path conforme seu projeto
import type { Person } from '@domain/person/person.type';
import { useRecordsContext } from '@domain/record/Records.context';


type Values = Pick<Involvement.Model, 'person_id' | 'type'>;

export function CreateInvolvementModal({ recordId }: { recordId: number }) {
    const [isSending, setIsSending] = useState(false);
    const [people, setPeople] = useState<Person.Model[]>([]);
    const [isLoadingPeople, setIsLoadingPeople] = useState(true);

    const { setIsCreateModalVisible, fetchInvolvements, involvements } = useInvolvementsContext();
    const [form] = Form.useForm<Values>();
    const app = App.useApp();

    const { fetchRecords } = useRecordsContext();

    useEffect(() => {
        setIsLoadingPeople(true);
        listPeople()
            .then(res => !hasServiceError(res) && setPeople(res.data.people))
            .finally(() => setIsLoadingPeople(false));
    }, []);

    const availablePeople = people.filter(
        p => !involvements.some(inv => inv.person_id === p.id)
    );

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);
        const response = await createInvolvement(recordId, values);
        await sleep(1000);
        setIsSending(false);

        if (hasServiceError(response)) return handleServiceError(app, response);

        close();
        fetchInvolvements(recordId);
        fetchRecords();
    };

    return (
        <Modal
            open
            title="Vincular Envolvido"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Vincular"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item name="person_id" label="Pessoa" rules={[{ required: true, message: 'Por favor, selecione uma pessoa.' }]}>
                    <Select
                        showSearch
                        loading={isLoadingPeople}
                        disabled={isLoadingPeople}
                        optionFilterProp="label"
                        options={availablePeople.map(p => ({ label: p.name, value: p.id }))}
                        placeholder={isLoadingPeople ? "Carregando pessoas..." : "Selecione uma pessoa"}
                    />
                </Form.Item>
                <Form.Item name="type" label="Papel" rules={[{ required: true, message: 'Por favor, selecione o papel do envolvido.' }]}>
                    <Select
                        options={Object.entries(INVOLVEMENT_TYPE_LABELS).map(([value, label]) => ({
                            label,
                            value,
                        }))}
                        placeholder="Selecione o papel"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}