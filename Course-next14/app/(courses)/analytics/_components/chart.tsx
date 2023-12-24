'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { Card } from '@/components/ui/card';

interface ChartProps {
    data: {
        name: string;
        total: number;
    }[];
}

export const Chart = ({ data }: ChartProps) => {
    return (
        <Card className="py-8">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" tickLine={false} axisLine={false} tickFormatter={(value: any) => `$${value}`} />
                    <Bar dataKey="total" fill="#0369a1" radius={[4, 4, 0, 0]} barSize={50} background={{ fill: '#eee' }} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};
