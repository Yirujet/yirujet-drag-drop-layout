function Watcher() {
    this.states = {}
}

Watcher.prototype.commit = function(name, ...args) {
    if (name.indexOf('/') > -1) {
        const [ moduleName, mutationName ] = name.split('/')
        const mutations = this.__rootStore__[moduleName].mutations
        if (mutations[mutationName]) {
            mutations[mutationName].apply(this.__rootStore__[moduleName], [this.__rootStore__[moduleName].states].concat(args))
        } else {
            throw new Error(`Action not found: ${ mutationName } in module: ${ moduleName }`)
        }
    } else {
        const mutations = this.mutations
        if (mutations[name]) {
            mutations[name].apply(this, [this.states].concat(args))
        } else {
            throw new Error(`Action not found: ${name}`)
        }
    }
}

Watcher.prototype.dispatch = function(name, ...args) {
    //  触发其他模块的action
    if (name.indexOf('/') > -1) {
        const [ moduleName, actionName ] = name.split('/')
        const actions = this.__rootStore__[moduleName].actions
        if (actions[actionName]) {
            return actions[actionName].apply(this.__rootStore__[moduleName], [
                { 
                    dispatch: this.__proto__.dispatch.bind(this.__rootStore__[moduleName]), 
                    commit: this.__proto__.commit.bind(this.__rootStore__[moduleName]), 
                    state: this.__rootStore__[moduleName].states,
                    get: this.__proto__.get.bind(this.__rootStore__[moduleName])
                }
            ].concat(args))
        } else {
            throw new Error(`Mutation not found: ${ actionName } in module: ${ moduleName }`)
        }
    } else {
        const actions = this.actions
        if (actions[name]) {
            return actions[name].apply(this, [
                { 
                    dispatch: this.__proto__.dispatch.bind(this), 
                    commit: this.__proto__.commit.bind(this), 
                    state: this.states,
                    get: this.__proto__.get.bind(this)
                }
            ].concat(args))
        } else {
            throw new Error(`Mutation not found: ${ name }`)
        }
    }
}

Watcher.prototype.get = function(name, ...states) {
    if (states.length > 0) {
        return [...states].reduce((p, c) => ({ ...p, [c]: this.__rootStore__[name].states[c] }), {})
    } else {
        return this.__rootStore__[name]
    }
}

const typeFn = Object.prototype.toString

export function createStore(scope, registory, store) {
    const { name, store: states, mutations, actions } = store
    const storeInstance = new Watcher()
    Object.keys(states).forEach(key => {
        storeInstance.states[key] = states[key]
    })
    storeInstance.mutations = mutations
    storeInstance.actions = actions
    registory[name] = storeInstance
    storeInstance.__super__ = scope
    storeInstance.__rootStore__ = registory
    return storeInstance
}
  
export function mapStates(moduleName, aryStates) {
    const res = {}
    if (Array.isArray(aryStates)) {
        aryStates.forEach(key => {
            let fn, state
            if (typeof key === 'string') {
                state = key
                fn = function() {
                    return this.StoreRegistory[moduleName].states[key]
                }
            } else if (typeFn.call(key) === '[object Object]') {
                state = [...Object.keys(key)].pop()
                fn = function() {
                    return [...Object.values(key)].pop().call(this.StoreRegistory[moduleName], this.StoreRegistory[moduleName].states)
                }
            } else {
                console.error(`invalid value type: ${ key }`)
            }
            if (fn) {
                res[state] = fn
            }
        })
    } else {
        console.error('The type of mapStates\'s 2nd argument must be array type')
    }
    return res
}

export function mapMutations(moduleName, aryMutations) {
    const res = {}
    if (Array.isArray(aryMutations)) {
        aryMutations.forEach(key => {
            let fn, mutation
            if (typeof key === 'string') {
                mutation = key
                fn = function() {
                    return this.StoreRegistory[moduleName].mutations[key]
                        .apply(this.StoreRegistory[moduleName], [this.StoreRegistory[moduleName].states, ...arguments])
                }
            } else if (typeFn.call(key) === '[object Object]') {
                mutation = [...Object.keys(key)].pop()
                fn = function() {
                    return [...Object.values(key)].pop().call(this.StoreRegistory[moduleName], this.StoreRegistory[moduleName].mutations)
                        .apply(this.StoreRegistory[moduleName], [this.StoreRegistory[moduleName].states, ...arguments])
                }
            } else {
                console.error(`invalid value type: ${ key }`)
            }
            if (fn) {
                res[mutation] = fn
            }
        })
    } else {
        console.error('The type of mapMutations\'s 2nd argument must be array type')
    }
    return res
}

export function mapActions(moduleName, aryActions) {
    const res = {}
    if (Array.isArray(aryActions)) {
        aryActions.forEach(key => {
            let fn, action
            if (typeof key === 'string') {
                action = key
                fn = function() {
                    return this.StoreRegistory[moduleName].actions[key]
                        .apply(
                            this.StoreRegistory[moduleName],                       
                            [
                                { 
                                    dispatch: this.StoreRegistory[moduleName].__proto__.dispatch.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName]), 
                                    commit: this.StoreRegistory[moduleName].__proto__.commit.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName]), 
                                    state: this.StoreRegistory[moduleName].__rootStore__[moduleName].states,
                                    get: this.StoreRegistory[moduleName].__proto__.get.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName])
                                },
                                ...arguments
                            ]
                        )
                }
            } else if (typeFn.call(key) === '[object Object]') {
                action = [...Object.keys(key)].pop()
                fn = function() {
                    return [...Object.values(key)].pop().call(this.StoreRegistory[moduleName], this.StoreRegistory[moduleName].actions)
                        .apply(
                            this.StoreRegistory[moduleName], 
                            [
                                { 
                                    dispatch: this.StoreRegistory[moduleName].__proto__.dispatch.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName]), 
                                    commit: this.StoreRegistory[moduleName].__proto__.commit.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName]), 
                                    state: this.StoreRegistory[moduleName].__rootStore__[moduleName].states,
                                    get: this.StoreRegistory[moduleName].__proto__.get.bind(this.StoreRegistory[moduleName].__rootStore__[moduleName])
                                }, 
                                ...arguments
                            ]
                        )
                }
            } else {
                console.error('invalid value type')
            }
            if (fn) {
                res[action] = fn
            }
        })
    } else {
        console.error('The type of mapActions\'s 2nd argument must be array type')
    }
    return res
}