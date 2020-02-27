var phonebookApp = angular.module('phonebookApp', ['ngResource', 'ngAnimate']);

function clearLog() {
	$("#infoLog").empty();
}

function logError(error) {
	$("#infoLog").append('<tr><td class="text-danger">' + error + '</td></tr>');
}

phonebookApp.controller('PhonebookController', ['$scope', '$resource', '$timeout', function ($scope, $resource, $timeout) {
    $scope.phoneEntries = $resource('/phoneentry').query();

    $scope.deleteEntry = function (entry_id) {
        io.socket.delete('/phoneentry/' + entry_id, function (data, jwres) {
        });
    }

    io.socket.get('/phoneentry/subscribe', function (data, jwr) {
        io.socket.on('new_entry', function (entry) {
            $timeout(function () {
                $scope.phoneEntries.unshift(entry);
            });
        });
        io.socket.on('entry_deleted', function (entry) {
            $timeout(function () {
                $scope.phoneEntries = $scope.phoneEntries.filter(function (item) {
                    return item.id !== entry.id;
                });
            });
        });
    });
}]);

function createEntry() {
    var phoneNumber = $('#phoneNumberInput')[0].value;
	const phoneRegex = /^[0-9\-+ ]+$/gim;
    var desc = $('#phoneDescInput')[0];
	clearLog();
    if (phoneNumber !== "" && phoneRegex.test(phoneNumber)) {
        var url = '/phoneentry?phoneNumber=' + phoneNumber;
        if (desc.value !== "") {
            url += '&description=' + desc.value;
        }
        io.socket.post(url, function (data, jwres) {
			if (jwres.statusCode !== 200) {
				if (jwres.hasOwnProperty("body")) {
					if (jwres.body.code === "E_UNIQUE") {
						logError("Taki numer już jest wpisany");
					}
				}
				else {
					logError("Nieznany błąd");
				}
			}
        });
    }
	else {
		if (phoneNumber === "") {
			logError("Podajże jakiś numer no...");
			return;
		}
		if (!phoneRegex.test(phoneNumber)) {
			logError("Ten numer jakiś dziwny...");
			return;
		}
	}
}