import React from 'react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/graph';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/markPoint';
import 'echarts/lib/component/markLine';


export default class Relationship extends React.Component {
  componentDidMount() {
    // 初始化
    var myChart2 = echarts.init(document.getElementById('relationship'));
    // 绘制图表
    myChart2.setOption({
        title: {
            text: this.props.companyName
        },
        tooltip: {},
        radar: {
            // shape: 'circle',
            name: {
                textStyle: {
                    color: '#fff',
                    backgroundColor: '#999',
                    borderRadius: 3,
                    padding: [3, 5]
               }
            },
            indicator: [
               { name: '科技文献', max: 100},
               { name: '软件著作权', max: 100},
               { name: '专利', max: 100},
               { name: '新闻', max: 100},
               { name: '招聘', max: 100},
               { name: '招投标', max: 100}
            ]
        },
        series: [{
            name: '创新能力数据',
            type: 'radar',
            // areaStyle: {normal: {}},
            data : [
                {
                    value : [80, 60, 50, 20, 70, 30],
                    name : '创新能力数据'
                }
            ]
        }]
    });
    }
    render() {
        return (
            <div id="relationship" style={{ width: '100%', height: 200 }}></div>
        );
    }
}
