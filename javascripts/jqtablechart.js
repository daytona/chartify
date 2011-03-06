// do not worry: these are only applied to array instances, not to the Array class
var jQTableChartArrayExtensions = {
	max : function () {
		var max = parseFloat(this[0]);
		for(var i = 1; i < this.length; i++) {
			if (parseFloat(this[i]) > max) max = parseFloat(this[i]);
		}
		return max;
	},
	min : function () {
		var min = parseFloat(this[0]);
		for(var i = 1; i < this.length; i++) {
			if (parseFloat(this[i]) < min) min = parseFloat(this[i]);
		}
		return min;
	},
	sum : function () {
		var sum = 0;
		for(var i = 0; i < this.length; i++) {
			sum = sum + parseFloat(this[i]);
		}
		return sum;
	},
	range : function (min, max, step) {
		for (var i = min; min + i * step <= max; i++) {
			this[i] = min + i * step;
		}
		return this;
	},
	round : function (precision) {
		var precisionFactor = 1;
		for (var i = 0; i < precision; i++) {
			precisionFactor = precisionFactor * 10;
		}
		arr = [];
		jQuery.extend(arr, jQTableChartArrayExtensions);
		for(var i = 0; i < this.length; i++) {
			arr[i] = Math.round(precisionFactor * this[i]) / precisionFactor;
		}
		return arr;
	},
	appendEach : function (str) {
		for(var i = 0; i < this.length; i++) {
			this[i] = this[i].toString() + str;
		}
		return this;
	},
	first : function (num) {
		var num = num || 1;
		var arr = [];
		jQuery.extend(arr, jQTableChartArrayExtensions);
		for(var i = 0; i < Math.min(this.length, num); i++) {
			arr[i] = this[i];
		}
		return arr;
	},
	last : function (num) {
		var num = num || 1;
		var arr = [];
		jQuery.extend(arr, jQTableChartArrayExtensions);
		for(var i = 0; i < Math.min(this.length, num); i++) {
			arr[i] = this[this.length - 1 - i];
		}
		return arr;
	},
	toPercentages : function () {
		var arr = [];
		jQuery.extend(arr, jQTableChartArrayExtensions);
		var sum = this.sum();
		for(var i = 0; i < this.length; i++) {
			arr[i] = 100 * this[i] / sum;
		}
		return arr;
	}
};
jQuery.extend(String.prototype, {toString : function () {return this;}});

(function( $ ){
	var settings = {
		chartWidth: 496, // in pixels
		chartHeight: 180,  // used when fixed height
		textColor: "666666",
		textSize: "11",
		colors: 	["ff9daa","ffc000","007ec6","433840","6cc05c","ff710f","ED1F27","95a8ad","0053aa"],
		barWidth : 20,
		barSpacing: 2,
		groupSpacing: 10,
		imageClass: '',
		margin: 20
	};
	var methods = {
		pie : function (options) {
			var mySettings = jQuery.extend({}, settings);
			if (options) {
				$.extend(mySettings, options);
			}
			jQuery.extend(mySettings.colors, jQTableChartArrayExtensions);
			return this.each(function (){
				var table = $(this);
				var data = table.jQTableData({isDistribution: true});
				var caption = data.getCaption();
				var config = {
					chxs : '0,' + mySettings.textColor + ',' + mySettings.textSize,
					chxt : 'x',
					chs : ''+mySettings.chartWidth+'x' + mySettings.chartHeight,   // size
					cht : 'p',   // chart type
					chdlp : 'r',  // legend style
					chma : '0,0|0,0'  // margins
				};
				config.chd = 't:' + data.toString(',', '|');  // data
				config.chdl = data.getValueRowHeaders().round(1).appendEach('%').join('|'); //legend
				config.chl = data.getColumnHeaders().join('|');  // labels
				config.chds = '0,' + data.getMax();  // scale
				config.chco = mySettings.colors.first(data.numColumns);  // colors
				params = serialize(config);
				table.after('<img class="'+mySettings.imageClass+'" src="http://chart.apis.google.com/chart?'+params+'" width="'+mySettings.chartWidth+'" height="'+mySettings.chartHeight+'" alt="'+caption+'" />');
				table.attr("style", "position: absolute; left: -9999px;");
			});
		},
		bar : function (options) {
			var mySettings = jQuery.extend({}, settings);
			if (options) {
				$.extend(mySettings, options);
			}
			jQuery.extend(mySettings.colors, jQTableChartArrayExtensions);
			return this.each(function (){
				var table = $(this);
				var tableOptions = {
					suppressContextLabels : table.hasClass("suppress-context-labels") ? true : false,
					isStacked : table.hasClass("stacked") ? true : false,
					isDistribution : table.hasClass("distribution") ? true : false,
					isPercent : table.hasClass("percent") ? true : false
				};
				var data = table.jQTableData(tableOptions);
				var caption = data.getCaption();
				var isGrouped = !tableOptions.isStacked && data.numRows > 1;
				var numGroups = isGrouped ? data.numRows : 1;
				var groupHeight = mySettings.barWidth * numGroups + mySettings.barSpacing * (numGroups - 1);
				var numMargins = (data.numRows > 1) ? 2 : 1; 
				var height;
				if (isGrouped) {
					height = groupHeight * data.numColumns + mySettings.groupSpacing * (data.numColumns - 1) + numMargins * mySettings.margin + 11;
				} else {
					height = data.numColumns * (groupHeight + mySettings.barSpacing) - mySettings.barSpacing + numMargins * mySettings.margin + 11;
				}
				var config = {
					chxs : '0,' + mySettings.textColor + ',' + mySettings.textSize + ',0,lt,' + mySettings.textColor + '|0,' + mySettings.textColor + ',' + mySettings.textSize + ',0,lt,'+ mySettings.textColor,
					chxt : 'x,y',
					cht : isGrouped ? 'bhg' : 'bhs', // chart type
					chs : ''+mySettings.chartWidth+'x' + height,  // size
					chma : '128|0',  // margins
					chxtc : '0,5|1,5',  // ticks style
					chdlp : 'b',
					chbh : mySettings.barWidth.toString() + ','+mySettings.barSpacing+',' + mySettings.groupSpacing, // bar width, spacing
					chco : mySettings.colors.first(data.numRows).join(',')
				};
				if (!tableOptions.suppressContextLabels) {
					var chm = '';
					for(var i = 0; i < data.numRows; i++) {
						if (i > 0) chm += '|';
						chm += 'N*0*'+((tableOptions.isDistribution || tableOptions.isPercent) ? '%' : '')+','+mySettings.textColor+','+i+',-1,' + mySettings.textSize + ",0,r:-3:0";   // bar labels
					}
					config.chm = chm;
				}

				config.chd = 't:' + data.toString(',', '|');

				var maxLabel = Math.round(data.getMax(tableOptions));
				var axisMargin = 1;
				if (tableOptions.isStacked && tableOptions.isDistribution) {
					axisMargin = 0;
				}
				var axisStep;
				if (maxLabel <= 60) {
					axisStep = 5;
				} else if (maxLabel <= 120) {
					axisStep = 10;
				} else {
					axisStep = 25;
				}

				var arr = [];
				jQuery.extend(arr, jQTableChartArrayExtensions);
				var xAxisLabels = arr.range(0, maxLabel + axisMargin * axisStep, axisStep);
				var max = xAxisLabels[xAxisLabels.length - 1];
				if (tableOptions.isDistribution || tableOptions.isPercent) xAxisLabels = xAxisLabels.appendEach('%');
				config.chxr = '0,0,'+max+'|1,0,10';
				config.chxl = '0:|'+xAxisLabels.join('|')+'|1:|'+data.getColumnHeaders().reverse().join('|');  // labels
				config.chds = '0,' + max;  // scale

				if (isGrouped || tableOptions.isStacked) {
					config.chdl = data.getRowHeaders().join('|'); // legend
				}

				params = serialize(config);
				table.after('<img class="'+mySettings.imageClass+'" src="http://chart.apis.google.com/chart?'+params+'" width="'+mySettings.chartWidth+'" height="'+height+'" alt="'+caption+'" />');    
				table.attr("style", "position: absolute; left: -9999px;");
			});
		},
		venn : function (options) {
			var mySettings = jQuery.extend({}, settings);
			if (options) {
				$.extend(mySettings, options);
			}
			jQuery.extend(mySettings.colors, jQTableChartArrayExtensions);
			return this.each(function (){
				var table = $(this);
				var data = table.jQTableData();
				var caption = data.getCaption();
				var max = data.getMax();
				var config = {
					chs : '' + mySettings.chartWidth + 'x' + mySettings.chartHeight,  // size
					cht : 'v',
					chdlp : 'r',
					chds : '0,'+max,
					chco : mySettings.colors.first(data.numColumns).join(',')  // colors
				};
				config.chd = 't:' + data.toString(',', '|');  // data
				config.chdl = data.getColumnHeaders().join('|');   // legend

				var params = serialize(config);
				table.after('<img class="'+mySettings.imageClass+'" src="http://chart.apis.google.com/chart?'+params+'" width="'+mySettings.chartWidth+'" height="'+mySettings.chartHeight+'" alt="'+caption+'" />');    
				table.attr("style", "position: absolute; left: -9999px;");
			});
		},
		// TODO: change this to handle any number of categories
		gender : function (options) {
			var mySettings = jQuery.extend({}, settings);
			if (options) {
				$.extend(mySettings, options);
			}
			$.extend(mySettings, {
				chartWidth : 480,
				chartHeight: 200,
				numCols : 20,
				numRows : 5
			});
			jQuery.extend(mySettings.colors, jQTableChartArrayExtensions);
			return this.each(function (){
				var table = $(this);
				var data = table.jQTableData({isDistribution: true});
				var men = data.getColumnData("men").round(0)[0];
				var menCols = Math.round(men / mySettings.numRows);
				var menRemainder = men % mySettings.numRows;
				var womenCols = menRemainder == 0 ? mySettings.numCols - menCols : mySettings.numCols - menCols - 1;
				var womenRemainder = (100 - men) % mySettings.numRows;
				var colWidth = Math.round(mySettings.chartWidth / mySettings.numCols);
				var rowHeight = Math.round(mySettings.chartHeight / mySettings.numRows);
				var womenWidth = mySettings.chartWidth - colWidth * menCols;
				var menColor = "#" + mySettings.colors[0];
				var womenColor = "#" + mySettings.colors[1];
				var html = [];
				html.push('<div class="gender-map" style="position:relative;width:'+mySettings.chartWidth+'px;height:'+mySettings.chartHeight+'px">');
				html.push('<div class="men" style="position:absolute; left:0; background-color: '+menColor+'; top:0;width: '+colWidth*menCols+'px;height: '+mySettings.chartHeight+'px"></div>');
				if (menRemainder > 0) {
					womenWidth -= colWidth;
					html.push('<div class="men" style="position:absolute; background-color: '+menColor+';top: 0; left: '+colWidth*menCols+'px;width: '+colWidth+'px;height: '+ menRemainder * rowHeight + 'px"></div>');
					html.push('<div class="women" style="position:absolute; background-color: '+womenColor+'; top:'+menRest * rowHeight+'px; left: '+colWidth*menCols+'px;width :'+colWidth+'px;height :'+rowHeight*womenRemainder+'px"></div>');
				}
				html.push('<div class="women" style="position:absolute; background-color: '+womenColor+'; right:0; top: 0;width :'+womenWidth+'px;height :'+rowHeight*mySettings.numRows+'px"></div>');
				html.push('</div>');

				table.after(html.join(''));
				table.attr("style", "position: absolute; left: -9999px;");
			});
		}
	};
	$.fn.jQTableChart = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.jQTableChart' );
		}    
	};
	function serialize (obj) {
		var str = [];
		for (var p in obj)
		str.push(p + "=" + encodeURIComponent(obj[p]));
		return str.join("&");
	}
})( jQuery );

(function( $ ){
	function tableData (table, options) {
		var settings = {
			isStacked : false,
			isDistribution : false
		};
		if (options) { 
			$.extend(settings, options);
		}
		this.table = $(table);
		this.caption = this.table.find("caption").html() || '';
		this.numRows = 0;
		this.numColumns = 0;
		this.rows = {};
		this.rowHeaders = [];
		this.columnHeaders = [];
		this.verboseColumnHeaders = {};
		this.initColumns();
		this.initRows(settings);
	}
	tableData.prototype = {
		initColumns: function () {
	    	var tmpVerboseColumnHeaders = {};
			var tmpColumnHeaders = [];
			this.table.find("thead th").each(function(index, element) {
				var content = $(element).html();
				if (content.length > 0) {
					var abbr = $(element).attr("abbr");
					if (!abbr) abbr = content;
					tmpVerboseColumnHeaders[abbr] = content;
					tmpColumnHeaders.push(abbr);
				}
			});
			this.verboseColumnHeaders = tmpVerboseColumnHeaders;
			this.columnHeaders = tmpColumnHeaders;
			this.numColumns = this.columnHeaders.length;
			return this;
		},
		initRows: function (options) {
			var options = options || {};
			var tmpRows = {};
			var tmpRowHeaders = [];
			this.table.find("tbody tr").each(function (i, row) {
				var arr = [];
				jQuery.extend(arr, jQTableChartArrayExtensions);
				$(row).find("td").each(function(j, cell) {
					arr.push(parseFloat($(cell).html()));
				});
				if (!options.isStacked && options.isDistribution) {
					arr = arr.toPercentages();
				}
				var header = $(row).find("th").html() || 'data';
				tmpRowHeaders.push(header);
				tmpRows[header] = arr;
			});
			if (options.isStacked && options.isDistribution) {
				for (var col = 0; col < this.numColumns; col++) {
					var sum = 0;
					for(var row = 0; row < tmpRowHeaders.length; row++) {
						sum += tmpRows[tmpRowHeaders[row]][col];
					}
					for(var row = 0; row < tmpRowHeaders.length; row++) {
						tmpRows[tmpRowHeaders[row]][col] = 100 * tmpRows[tmpRowHeaders[row]][col] / sum;
					}
				}
			}
			this.rowHeaders = tmpRowHeaders;
			this.rows = tmpRows;
			this.numRows = this.rowHeaders.length;
			return this;
		},
		toString: function (colSep, rowSep) {
			var arr = [];
			jQuery.extend(arr, jQTableChartArrayExtensions);
			for (var key in this.rows) {
				arr.push(this.rows[key].round(1).join(colSep));
			}
			return arr.join(rowSep);
		},
		getMax: function (options) {
			var options = options || {};
			if (options.isStacked) {
				var globalMax = 0;
				for (var i = 0; i < this.numColumns; i++) {
					var sum = 0;
					for (var key in this.rows) {
						sum += this.rows[key][i];
					}
					if (sum > globalMax) globalMax = sum;
				}
				return globalMax;
			} else {
				var i = 0;
				var globalMax;
				for (var key in this.rows) {
					var localMax = this.rows[key].max();
					if (i == 0) {
						globalMax = localMax;
					} else if (localMax > globalMax) {
						globalMax = localMax;
					}
					i++;
				}
				return globalMax;
			}
		},
		getColumnHeaders: function () {
			return this.columnHeaders;
		},
		getRowHeaders: function () {
			return this.rowHeaders;
		},
		getValueRowHeaders: function () {
			return this.rows[this.rowHeaders[0]];
		},
		getColumnHeadersIndices: function () {
			var obj = {};
			for (var i = 0; i < this.numColumns; i++) {
				obj[this.columnHeaders[i]] = i;
			}
			return obj;
		},
		getColumnData: function (columnHeader) {
			for (var index = 0; index < this.numColumns; index++) {
				if (this.columnHeaders[index] == columnHeader) break;
			}
			var data = [];
			jQuery.extend(data, jQTableChartArrayExtensions);
			for (key in this.rows) {
				data.push(this.rows[key][index]);
			}
			return data;
		},
		getCaption: function () {
			return this.caption;
		}
	};
	$.fn.jQTableData = function (options) {
		return new tableData($(this), options);
	};
})( jQuery );

