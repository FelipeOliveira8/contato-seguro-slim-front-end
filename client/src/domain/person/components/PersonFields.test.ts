import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';

import {
    cleanCpf,
    cleanPersonValues,
    formatCpf,
    formatDate,
    type Values,
} from './PersonFields';

describe('PersonFields helpers', () => {
    describe('formatCpf', () => {
        it('returns empty string for empty input', () => {
            expect(formatCpf('')).toBe('');
            expect(formatCpf(undefined)).toBe('');
        });

        it('returns raw digits when 3 or fewer digits are provided', () => {
            expect(formatCpf('1')).toBe('1');
            expect(formatCpf('12')).toBe('12');
            expect(formatCpf('123')).toBe('123');
        });

        it('formats correctly between 4 and 6 digits', () => {
            expect(formatCpf('1234')).toBe('123.4');
            expect(formatCpf('123456')).toBe('123.456');
        });

        it('formats correctly between 7 and 9 digits', () => {
            expect(formatCpf('1234567')).toBe('123.456.7');
            expect(formatCpf('123456789')).toBe('123.456.789');
        });

        it('formats correctly with 10 and 11 digits (full mask)', () => {
            expect(formatCpf('1234567890')).toBe('123.456.789-0');
            expect(formatCpf('12345678901')).toBe('123.456.789-01');
        });

        it('strips non-numeric characters and limits to 11 digits', () => {
            expect(formatCpf('123.456.789-01')).toBe('123.456.789-01');
            expect(formatCpf('123abc456def78901extra')).toBe('123.456.789-01');
        });
    });

    describe('formatDate', () => {
        it('returns empty string for empty input', () => {
            expect(formatDate('')).toBe('');
            expect(formatDate(undefined)).toBe('');
        });

        it('returns raw digits when 2 or fewer digits are provided', () => {
            expect(formatDate('1')).toBe('1');
            expect(formatDate('15')).toBe('15');
        });

        it('formats correctly between 3 and 4 digits (day/month partial)', () => {
            expect(formatDate('150')).toBe('15/0');
            expect(formatDate('1503')).toBe('15/03');
        });

        it('formats correctly between 5 and 8 digits (day/month/year)', () => {
            expect(formatDate('15031')).toBe('15/03/1');
            expect(formatDate('150319')).toBe('15/03/19');
            expect(formatDate('1503199')).toBe('15/03/199');
            expect(formatDate('15031990')).toBe('15/03/1990');
        });

        it('strips non-numeric characters and limits to 8 digits (10 chars with slashes)', () => {
            expect(formatDate('15/03/1990')).toBe('15/03/1990');
            expect(formatDate('15abc03def1990extra')).toBe('15/03/1990');
        });
    });

    describe('cleanCpf', () => {
        it('removes punctuation from formatted CPF', () => {
            expect(cleanCpf('123.456.789-01')).toBe('12345678901');
        });

        it('returns numeric string as-is', () => {
            expect(cleanCpf('12345678901')).toBe('12345678901');
        });

        it('handles empty or undefined values', () => {
            expect(cleanCpf('')).toBe('');
            expect(cleanCpf(undefined)).toBe('');
        });
    });

    describe('cleanPersonValues', () => {
        it('cleans CPF punctuation and formats birth_date from dayjs object to YYYY-MM-DD', () => {
            const rawValues: Values = {
                name: 'João Silva',
                cpf: '123.456.789-01',
                email: 'joao@example.com',
                birth_date: dayjs('1995-04-20'),
            };

            const payload = cleanPersonValues(rawValues);

            expect(payload).toEqual({
                name: 'João Silva',
                cpf: '12345678901',
                email: 'joao@example.com',
                birth_date: '1995-04-20',
            });
        });

        it('formats birth_date correctly when provided as YYYY-MM-DD string', () => {
            const rawValues: Values = {
                name: 'Maria Oliveira',
                cpf: '987.654.321-09',
                email: 'maria@example.com',
                birth_date: '1988-12-05',
            };

            const payload = cleanPersonValues(rawValues);

            expect(payload).toEqual({
                name: 'Maria Oliveira',
                cpf: '98765432109',
                email: 'maria@example.com',
                birth_date: '1988-12-05',
            });
        });

        it('formats birth_date correctly when provided as DD/MM/YYYY string', () => {
            const rawValues: Values = {
                name: 'Carlos Souza',
                cpf: '111.222.333-44',
                email: 'carlos@example.com',
                birth_date: '15/03/1990',
            };

            const payload = cleanPersonValues(rawValues);

            expect(payload).toEqual({
                name: 'Carlos Souza',
                cpf: '11122233344',
                email: 'carlos@example.com',
                birth_date: '1990-03-15',
            });
        });

        it('returns empty string if birth_date is empty or invalid', () => {
            const rawValues: Values = {
                name: 'Teste',
                cpf: '',
                email: '',
                birth_date: '',
            };

            const payload = cleanPersonValues(rawValues);

            expect(payload.birth_date).toBe('');
        });
    });
});
