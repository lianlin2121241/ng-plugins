angular.module("synway.pagination", [])
	.factory("synwayPage", function() {
		var pageData={};
		pageData.getPageList = function(setting){
			var pageList = [];
			if(setting.numberOfPages <= setting.middleLength+2){
				for(var i=1 ; i<=setting.numberOfPages; i++){
					pageList.push(i);
				}
			}else{
				var offset = (setting.middleLength+1)/2;
				if(setting.currentPage <= offset+1) {
					// 左边没有...
					for(i = 1; i <= 1+setting.middleLength; i++) {
						pageList.push(i);
					}
					pageList.push('...');
					pageList.push(setting.numberOfPages);
					//    >实际总页数-每页的一半
				} else if(setting.currentPage >= setting.numberOfPages - offset) {
					pageList.push(1);
					pageList.push('...');
					for(i = setting.middleLength; i >= 1; i--) {
						pageList.push(setting.numberOfPages - i);
					}
					pageList.push(setting.numberOfPages);
				} else {
					// 最后一种情况，两边都有...
					pageList.push(1);
					pageList.push('...');
					for(i = offset-1; i >= 1; i--) {
						pageList.push(setting.currentPage - i);
					}
					pageList.push(setting.currentPage);
					for(i = 1; i <= offset-1; i++) {
						pageList.push(setting.currentPage + i);
					}
					pageList.push('...');
					pageList.push(setting.numberOfPages);
				}
			}
			return pageList;
		}
		return pageData;
	})
	.directive("synwayPagination", ["synwayPage", function(synwayPage) {
		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="pagination-panel">' +
				'<ul class="pagination">'+
				'<li ng-disabled="setting.currentPage == 1" ng-click="prevPage()"><a>&laquo;</a></li>'+
				'<li ng-repeat="item in pageList track by $index" ng-class="{active:item==setting.currentPage}" ng-click="changeCurrentPage(item)"><a >{{item}}</a></li>'+
			    '<li ng-click="nextPage()"><a ng-disabled="setting.currentPage == setting.numberOfPages">&raquo;</a></li>'+
				'</ul>'+
				'<div class="pagination-text-panel">'+
				'<span class="pagination-text">显示</span>'+
				'<span class="pagination-text">{{(setting.currentPage-1)*setting.itemsPerPage+1}}</span>'+
				'<span class="pagination-text">-</span>'+
				'<span class="pagination-text">{{(setting.numberOfPages==setting.currentPage?setting.totalItems:setting.currentPage*setting.itemsPerPage)}}</span>'+
				'<span class="pagination-text">条记录，</span>'+
				'<span class="pagination-text">共</span>'+
				'<span class="pagination-text">{{setting.totalItems}}</span>'+
				'<span class="pagination-text">条，</span>'+
				'<span class="pagination-text">每页 </span>'+
				'<input type="text" title="请回车进行确认" ng-keydown="jumpToPage($event)" name="rows" ng-model="currentItemsPerPage" class="form-control input-sm pagination-input">'+
				'<span class="pagination-text"> 条</span>'+
				'</div>',
			scope: {
				pg: '=',
				loadFun:"="
			},
			link: function(scope, element, attrs) {
				var intReg=/^\+?[1-9]\d*$/;
				scope.currentItemsPerPage=0;		//当前组件绑定的页显示条数
				// 默认配置
				scope.pageOptionDefault={
					currentPage : 1,                //当前显示页
					totalItems : 110,               //内容总共多少条
					itemsPerPage : 10,              //每页显示几条
					middleLength : 5,				//中间数量
					numberOfPages:0					//总共页数
				}
				//设置默认值 extend不管用，scope.pg不能接收新对象
				scope.pg["currentPage"]=scope.pg["currentPage"]||scope.pageOptionDefault.currentPage;
				scope.pg["totalItems"]=scope.pg["totalItems"]||scope.pageOptionDefault.totalItems;
				scope.pg["itemsPerPage"]=scope.pg["itemsPerPage"]||scope.pageOptionDefault.itemsPerPage;
				scope.pg["middleLength"]=scope.pg["middleLength"]||scope.pageOptionDefault.middleLength;
				scope.pg["numberOfPages"]=scope.pg["numberOfPages"]||scope.pageOptionDefault.numberOfPages;
				scope.setting=scope.pg;

				//点击按钮
				scope.changeCurrentPage = function(p) {
					if(p == '...') {
						return;
					}
					scope.setting.currentPage = p;
				};
				//点击上一页按钮
				scope.prevPage = function() {
					if(scope.setting.currentPage > 1) {
						scope.setting.currentPage -= 1;
					} else {
						scope.setting.currentPage = 1;
					}
				};
				//点击下一页按钮
				scope.nextPage = function() {
					if(scope.setting.currentPage < scope.setting.numberOfPages) {
						scope.setting.currentPage += 1;
					} else {
						scope.setting.currentPage = scope.setting.numberOfPages;
					}
				};
				// 跳转页
				scope.jumpToPage = function(e) {
					if(e.keyCode=="13"){
						if(!intReg.test(scope.currentItemsPerPage)){
		            		 scope.currentItemsPerPage=scope.setting.itemsPerPage;
		            		 return;
		            	}
						scope.setting.itemsPerPage=parseInt(scope.currentItemsPerPage);
					}
				};

				//处理中间显示几个分页，如果不是奇数的时候处理一下
				if(scope.setting.middleLength % 2 === 0) {
					scope.setting.middleLength = scope.setting.middleLength - 1;
				}

				//获取分页配置参数
				function getPagination() {
					scope.currentItemsPerPage=scope.setting.itemsPerPage;
					// 当前页数
					scope.setting.currentPage = parseInt(scope.setting.currentPage);
					// 当前条数
					scope.setting.totalItems = parseInt(scope.setting.totalItems);
					// 计算页数
					scope.setting.numberOfPages = Math.ceil(scope.setting.totalItems / scope.setting.itemsPerPage);

					// 当前页数小于1
					if(scope.setting.currentPage < 1) {
						scope.setting.currentPage = 1;
					}
					// 当前页数大于总页数
					if(scope.setting.currentPage > scope.setting.numberOfPages&&scope.setting.numberOfPages!=0) {
						scope.setting.currentPage = scope.setting.numberOfPages;
					}

					//计算页码数据
					scope.pageList = synwayPage.getPageList(scope.setting);
				}

				//监听当前页+当页条数数据变化
				scope.$watch(function() {
                    return scope.setting.currentPage+scope.setting.itemsPerPage;
                }, function(newValue, oldValue) {
                    getPagination();
                    scope.loadFun(scope.setting);
                });

				//监听数据变化
				scope.$watch(function() {
                    return scope.pg.totalItems;
                }, function(newValue, oldValue) {
                	scope.setting.totalItems=scope.pg.totalItems;
                    getPagination();
                });
			}
		}
	}])