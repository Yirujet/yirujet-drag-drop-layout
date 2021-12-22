export function Common(methodName, ...args) {
    const getOtherComps = (compList, ...comps) => compList.filter(item => ![...comps.map(e => e.id)].includes(item.id))
    const comp_interset_with_rect = (comp, rect) => {
        const { left: compLeft, width: compWidth, top: compTop, height: compHeight } = comp.$el.getBoundingClientRect()
        const compRight = compLeft + compWidth
        const compBottom = compTop + compHeight
        const { left: rectLeft, right: rectRight, top: rectTop, bottom: rectBottom } = rect
        const nonIntersectLeft = compRight <= rectLeft
        const nonIntersectTop = compBottom <= rectTop
        const nonIntersectRight = compLeft >= rectRight
        const nonIntersectBottom = compTop >= rectBottom
        return !(nonIntersectLeft || nonIntersectTop || nonIntersectRight || nonIntersectBottom)
    }
    const valid_area_composed_in_rect = (compList, rect) => {
        /**
         * Author: Aboli
         * Function: 从指定区域(p1, p2, p3, p4)的剩余区域（即排除组件1、组件2、...、组件n所占区域）找出所有可使用矩形区域算法
         * 
         *                               p6         p8          p14                  p16                                 
         *          p1┌───────────────────┬──────────┬───────────┬────────────────────┬─────────────────────────────────┐p2
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *         p13┆┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┊┄┄┄┄┄┄┄┄┄┄┊┄┄┄┄┄┄┄┄┄b1╔════════════════════╗b2┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┆p18
         *          p5┆┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄a1╔══════════╗a2┄┄┄┄┄┄p11║                    ║┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┆p20
         *            ┆                   ║   Comp1  ║           ║                    ║                                 ┆
         *            ┆                   ║          ║           ║       Comp2        ║                                 ┆
         *         p10┆┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄a3╚══════════╝a4┄┄┄┄┄┄p12║                    ║┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┆p21
         *            ┆                   ┊          ┊           ║                    ║                                 ┆
         *            ┆                   ┊          ┊           ║                    ║                                 ┆
         *         p22┆┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┊┄┄┄┄┄┄┄┄┄┄┊┄┄┄┄┄┄┄┄┄b3╚════════════════════╝b4┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┆p19
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *            ┆                   ┊          ┊           ┊                    ┊                                 ┆
         *          p3└──────────────────────────────────────────┴────────────────────┴─────────────────────────────────┘p4
         *                               p7         p9          p15                  p17                                 
         * 
         * Steps: 
         *  1. 找出组件的四边延长线与区域边框、其余组件（若延长线与其相交）的交点坐标集合记为pointList: Array<'x, y'>
         *  2. 将pointList中的横纵坐标分别取出去重并升序排列，分别放入xPointListSorted、yPointListSorted
         *  3. 遍历出所有横纵坐标可构成的矩形区域，并判断当前构成的矩形区域中是否包含组件，若不包含即为空白的可使用区域
         */
        const rasterizedCoordinatePoints = rasterized_coordinate_points_in_rect(compList, rect)
        const xPoints = [...new Set(rasterizedCoordinatePoints.map(e => e.split(',')[0]))].sort((e1, e2) => e1 - e2)
        const yPoints = [...new Set(rasterizedCoordinatePoints.map(e => e.split(',')[1]))].sort((e1, e2) => e1 - e2)
        let aryRect = []
        for (let xIndex = 0, xLen = xPoints.length; xIndex < xLen - 1; xIndex++) {
            for (let xCursor = xIndex + 1; xCursor < xLen; xCursor++) {
                for (let yIndex = 0, yLen = yPoints.length; yIndex < yLen - 1; yIndex++) {
                    for (let yCursor = yIndex + 1; yCursor < yLen; yCursor++) {
                        const left = parseFloat(xPoints[xIndex])
                        const right = parseFloat(xPoints[xCursor])
                        const top = parseFloat(yPoints[yIndex])
                        const bottom = parseFloat(yPoints[yCursor])
                        aryRect.push(
                            {
                                left,
                                right,
                                top,
                                bottom,
                                width: right - left,
                                height: bottom - top
                            }
                        )
                    }
                }
            }
        }
        let aryValidRect = []
        aryRect.forEach(rectItem => {
            if (compList.length === 0) {
                aryValidRect.push(rectItem)
            } else {
                if (compList.every(compItem => !comp_interset_with_rect(compItem, rectItem))) {
                    aryValidRect.push(rectItem)
                }
            }
        })
        return aryValidRect
    }

    const rasterized_coordinate_points_in_rect = (compList, rect) => {
        //  找出这个区域内的组件
        const intersectComps = compList.filter(comp => comp_interset_with_rect(comp, rect))
        const { left: rectLeft, right: rectRight, top: rectTop, bottom: rectBottom } = rect
        const aryPoints = []
        //  区域的四角坐标
        aryPoints.push(
            `${rectLeft},${rectTop}`,
            `${rectLeft},${rectBottom}`,
            `${rectRight},${rectTop}`,
            `${rectRight},${rectBottom}`
        )
        intersectComps.forEach(comp => {
            const { left: compLeft, width: compWidth, top: compTop, height: compHeight } = comp.$el.getBoundingClientRect()
            const compRight = compLeft + compWidth
            const compBottom = compTop + compHeight
            //  组件的四角坐标
            aryPoints.push(
                `${compLeft},${compTop}`,
                `${compRight},${compTop}`,
                `${compRight},${compBottom}`,
                `${compLeft},${compBottom}`
            )
            //  组件的四边与区域的交点坐标
            aryPoints.push(
                `${rectLeft},${compTop}`,
                `${rectRight},${compTop}`,
                `${rectLeft},${compBottom}`,
                `${rectRight},${compBottom}`,
                `${compLeft},${rectTop}`,
                `${compLeft},${rectBottom}`,
                `${compRight},${rectTop}`,
                `${compRight},${rectBottom}`
            )
            //  组件的四边延长线与其余组件的交点坐标
            const otherComps = getOtherComps(compList, comp)
            //  与上边延长线相交
            const intersectCompsWithTopBorder = otherComps.filter(item => {
              const { top, bottom } = item.$el.getBoundingClientRect()
              return top < compTop && bottom > compTop
            })
            //  与下边延长线相交
            const intersectCompsWithBottomBorder = otherComps.filter(item => {
              const { top, bottom } = item.$el.getBoundingClientRect()
              return top < compBottom && bottom > compBottom
            })
            //  与左边延长线相交
            const intersectCompsWithLeftBorder = otherComps.filter(item => {
              const { left, right } = item.$el.getBoundingClientRect()
              return left < compLeft && right > compLeft
            })
            //  与右边延长线相交
            const intersectCompsWithRightBorder = otherComps.filter(item => {
              const { left, right } = item.$el.getBoundingClientRect()
              return left < compRight && right > compRight
            })
            if (intersectCompsWithTopBorder.length > 0) {
                intersectCompsWithTopBorder.forEach(item => {
                    const { left, right } = item.$el.getBoundingClientRect()
                    aryPoints.push(
                        `${left},${compTop}`,
                        `${right},${compTop}`
                    )
                })
            }
            if (intersectCompsWithBottomBorder.length > 0) {
                intersectCompsWithBottomBorder.forEach(item => {
                    const { left, right } = item.$el.getBoundingClientRect()
                    aryPoints.push(
                        `${left},${compBottom}`,
                        `${right},${compBottom}`
                    )
                })
            }
            if (intersectCompsWithLeftBorder.length > 0) {
                intersectCompsWithLeftBorder.forEach(item => {
                  const { top, bottom } = item.$el.getBoundingClientRect()
                    aryPoints.push(
                        `${compLeft},${top}`,
                        `${compLeft},${bottom}`
                    )
                })
            }
            if (intersectCompsWithRightBorder.length > 0) {
                intersectCompsWithRightBorder.forEach(item => {
                  const { top, bottom } = item.$el.getBoundingClientRect()
                    aryPoints.push(
                        `${compRight},${top}`,
                        `${compRight},${bottom}`
                    )
                })
            }
        })
        return [...new Set(aryPoints)]
    }
    const MethodObj = {
        rasterized_coordinate_points_in_rect,
        valid_area_composed_in_rect
    }
    return MethodObj[methodName].apply(this, args)
}

export function getOffset(node, parent, offset) {
  offset = offset || {offsetX: 0, offsetY: 0}
  if(node === parent) {
    return offset
  }

  offset.offsetX += node.offsetLeft
  offset.offsetY += node.offsetTop
  
  return getOffset(node.offsetParent, parent, offset)
}

export function getParentNode(node, className) {
  if (Array.from(node.classList).includes(className)) {
    return node
  }
  return getParentNode(node.parentNode, className)
}

export function intersect(comp1, comp2) {
  const { x: x1, w: w1, y: y1, h: h1 } = comp1
  const { x: x2, w: w2, y: y2, h: h2 } = comp2
  if (!(x1 >= (x2 + w2) || (x1 + w1) <= x2 || y1 >= (y2 + h2) || (y1 + h1) <= y2)) {
      return true
  }
  return false
}

export function layoutInfo(list) {
  let aryRtn = []
  list.forEach(node => {
      for(let row = node.y; row < node.y + node.h; row++) {
          if(!aryRtn[row]){
              aryRtn[row] = []
          }
          for(let col = node.x; col < node.x + node.w; col++){
              aryRtn[row][col] = node.id
          }
      }
  })
  return aryRtn
}

export function calcMinTop(comp, list) {
  const grid = layoutInfo(list)
  for(let row = comp.y - 1; row >= 0; row--) {
    if(!grid[row]) continue
    for(let col = comp.x; col < comp.x + comp.w; col++) {
      if(grid[row][col]) {
        return row + 1
      }
    }
  }
  return 0
}