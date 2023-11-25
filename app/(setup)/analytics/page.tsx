import { DataCard } from "./_components/data-card";
import { Chart } from "./_components/chart";

const AnalyticsPage = async () => {

    const data = [
        {
            name: 'adu',
            total: 20
        },
        {
            name: 'adu2',
            total: 30
        },
        {
            name: 'adu3',
            total: 40
        }
    ]
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <DataCard
                    label="Total Revenue"
                    value={80}
                    shouldFormat
                />
                <DataCard
                    label="Total Sales"
                    value={20}
                />
            </div>
            <Chart
                data={data}
            />
        </div>
    );
}

export default AnalyticsPage;