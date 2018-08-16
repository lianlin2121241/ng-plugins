/**
 * @file  表头冻结
 * @author limingle
 * @copyright Synway SFE
 * @createDate 2017-11-17 14:40:11
 */

'use strict';
angular.module("synway.tableHeaderFreeze", [])
	.directive('tableHeaderFreeze', ["$timeout", "$window", function ($timeout, $window) {
		return {
			restrict: 'AECM',
			scope: {
				tableData: "="
			},
			compile: function (tEle, tAttrs) {
				var tbl = $(tEle);
				var tblParent = tbl.closest(".table-panel");
				tblParent.css("position", "relative");
				tbl.find("th").append("<span class='th-width' style='visibility:hidden;height:0px;margin:0px;padding:0px;display:block;font-size:0;'></span>");
				var theadTemp = tbl.find("thead").clone();
				var tblClass = tbl.attr("class");
				var newTable = $("<div class='temp-tbl-head' ><table style='margin-bottom:0px;'></table></div>").css({ "position": "absolute", "top": "-10000px", "left": "-10000px", "width": "100%" });
				newTable.find("table").append(theadTemp)
					.attr("class", tblClass);
				tblParent.append(newTable);

				return function (scope, element, attrs) {
					scope.$watch(function () {
						return scope.tableData;
					}, function (newValue, oldVale) {
						if (!newValue || newValue == oldVale) {
							return;
						}
						newTable.css({ "top": "-10000px", "left": "-10000px" })
						//延时绑定
						$timeout(function () {
							scope.$emit('ngRepeatFinished');
						});
					}, true)

					//延时绑定
					scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
						console.log("repeat完毕");
						resize();
					})

					function resize() {
						var tblWidth = tbl.width();
						newTable.width(tblWidth)
						var cloneThWidthDiv = newTable.find(".th-width");
						tbl.find(".th-width").each(function (index, item) {
							cloneThWidthDiv.eq(index).width($(item).width());
						})
						newTable.css({ "top": "0px", "left": "0px" })
					}
					$($window).on("resize", resize)
				}
			}
		}
	}])