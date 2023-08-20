import React, {useEffect, useRef} from "react";
import * as echarts from 'echarts';

export function Echart(props){
    const {wrapperCss, option} = props;
    const chartRef = useRef(null);

    useEffect(() => {
        const charInstance = echarts.init(chartRef.current);
        charInstance.setOption(option);

        return () => {
            charInstance.dispose();
        };
    }, [option]);

    return <div css={wrapperCss} ref={chartRef} />;
}