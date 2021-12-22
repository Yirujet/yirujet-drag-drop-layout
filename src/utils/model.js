export const RESIZE_NODES = {
    LEFT_TOP: 'leftTop',
    TOP: 'top',
    RIGHT_TOP: 'rightTop',
    RIGHT: 'right',
    RIGHT_BOTTOM: 'rightBottom',
    BOTTOM: 'bottom',
    LEFT_BOTTOM: 'leftBottom',
    LEFT: 'left'
}

export const METHOD_NAMES = {
    VACBTC: {
        name: 'valid_area_composed_in_rect',
        description: '获取指定区域中的有效区域',
        condition: `
            从指定区域中找到所有的栅格化坐标点，遍历横纵坐标点排除掉所有与组件有重叠的区域
        `
    },
    RCPIR: {
        name: 'rasterized_coordinate_points_in_rect',
        description: '获取指定区域的栅格化坐标点集合',
        condition: `将每个组件的四边延长，必将会跟最大区域的四边或其余组件相交`
    }
}

export const OPERATION_TYPE = {
    DRAG: 'drag',
    RESIZE: 'resize'
}

export const CANVAS_MODE = {
    PREVIEW: 'preview',
    DESIGN: 'design'
}