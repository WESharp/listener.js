/**
 * 全局事件对象;
 * 区分了事件和命名空间的概念
 *
 * @example
 *
 * A模块内监听'com.myTest'频道下的say事件
 * listener.on('com.myTest', 'say', function(d){alert(d);});
 *
 * B模块内触发'com.myTest'频道下的say事件
 * listener.trigger('com.myTest', 'say', 'Hello World!');
 */
(function(){
	var that = {},
	EventList = {},
	slice = [].slice;

	/**
	 * [on 绑定事件]
	 * @param  {[string]}    channel  频道，命名空间，避免各种名称变量名冲突 
	 * @param  {[string]}   eventName 事件名称
	 * @param  {Function} callback  [回调事件]
	 * @param  {[Object]}   context   [事件上下文]
	 */
	var on = function (channel, eventName, callback, context) {
		var curChannel  = EventList[channel];

		if (!curChannel) {
			curChannel = EventList[channel] = {};
		}

		curChannel[eventName] = curChannel[eventName] || [];
		curChannel[eventName].push({
			'func' : callback,
			'context' :context || that
		})
			
	};

	/**
	 * [off 方法]
	 * @param  {String}   channel   [频道，命名空间，避免各种变量命名冲突]
	 * @param  {String}   eventName [事件名称]
	 * @param  {Function} callback  [回调函数]
	 * @param  {Object}   context   [执行上下文]
	 * @return {[type]}             [description]
	 */
	var off = function (channel, eventName, callback ,context) {
		context = context || that;
		var taskList, handle;
		if (EventList[channel] && EventList[channel][eventName] && EventList[channel][eventName].length > 0) {
			taskList = EventList[channel][eventName];

			for (var i = taskList.length; i--;) {
				handle = taskList[i];
				if (handle.func == callback && handle.context == context ) {
					taskList.splice(i, 1);
				}
			}
			handle.func.apply()

		}

	};

	/**
	 * [trigger description]
	 * @param  {String} channel   频道，命名空间
	 * @param  {String} eventName 事件名称
	 * @param  {data}   data      传给执行函数的实参 
	 * @return {[type]}           [description]
	 */
	var trigger = function (channel, eventName, data) {

		if (EventList[channel] && EventList[channel][eventName] && EventList[channel][eventName].length > 0) {

			var taskList = EventList[channel][eventName],
				curHandles = [];
				for(var i = taskList.length; i--;) {
					curHandles.push({
						'handle' : taskList[i],
						'args'   : slice.call(arguments, 2)
					});
				}

				do {
					var curTask = curHandles.shift();
					var handle = curTask.handle;
					try {
						handle.func.apply(curTask.context, curTask.args);
					}
					catch (exp) {
						
					}
				} while(curHandles.length)

				if (curHandles.length > 0) {
				 	setInterval(arguments.callee, 50)
				 }
		}
	}

	/**
	 * [once description]
	 * @param  {[type]}   channel   [description]
	 * @param  {[type]}   eventName [description]
	 * @param  {Function} callback  [description]
	 * @param  {[type]}   context   [description]
	 * @return {[type]}             [description]
	 */
	var once = function (channel, eventName, callback, context) {
		var _once = function () {
			that.off(channel, eventName, _once);
			return callback.apply(context || that, arguments);
		}
		on(channel, eventName, _once, context);
	}

	that.on = on;
	that.off = off;
	that.trigger = trigger;
	that.once = once;
	window.listener = window.listener || that;
})()