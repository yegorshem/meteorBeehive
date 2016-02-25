//mongo database holding each entry from a form
BeeData = new Mongo.Collection("beeData");

// different routes using package: iron:router

/*
 main page
 */
Router.route('/', function () {
    this.render('form');
    this.layout('layout');
});

/*
 place to render all data for admin
 TODO: make accessible for only admin
 */
Router.route('/admin', function () {
    this.render('allData');
    this.layout('layout');
});

/*
 after submit, it sends user to a page where only their submitted data is  displayed
 */
Router.route('/hive/:hiveID', function () {
        this.render('singleData', {
            data: function () {
                return BeeData.findOne({hiveID: this.params.hiveID});
            }
        });
        this.layout('layout');
    },
    {
        name: 'hive.show'
    });

/*
 Packages used:
 nicolaslopezj:excel-export
 check

 This page is responsible for exporting all the data in the beeData database into an excel spreadsheet
 */
Router.route('/export', function () {
    var data = BeeData.find().fetch();
    var fields = [
        {
            key: 'hiveID',
            title: 'hiveID'
        },
        {
            key: 'collectionDate',
            title: 'collectionDate'
        },
        {
            key: 'samplePeriod',
            title: 'samplePeriod'
        },
        {
            key: 'miteCount',
            title: 'miteCount'
        },
        {
            key: 'createdOn',
            title: 'createdOn'
        }
    ];

    //generating a date for a unique file name
    var d = new Date();
    var title = 'BeehiveData ' + d.toDateString();

    //downloading the file
    var file = Excel.export(title, fields, data);
    var headers = {
        'Content-type': 'application/vnd.openxmlformats',
        'Content-Disposition': 'attachment; filename=' + title + '.xlsx'
    };

    this.response.writeHead(200, headers);
    this.response.end(file, 'binary');
}, {where: 'server'});

/*
 all the code the user's browser will run
 */
if (Meteor.isClient) {

    //current website subscribes to the beeData collection of the Mongo database
    Meteor.subscribe("beeData");

    //a function that orders all the data submitted
    Template.allData.helpers({
            "beeData": function () {
                return BeeData.find({}, {sort: {createdOn: -1}}) || {};
            }
        }
    );

    Template.singleData.helpers({
            "hiveData": function () {
                return BeeData.find({hiveID: this.hiveID}, {sort: {createdOn: -1}}) || {};
            }
        }
    );

    //prevents form from redirecting and inserts data into BeeData database
    Template.form.events({
        "submit form": function (event) {
            event.preventDefault();

            var hiveID = ($(event.target).find('input[name=hiveID]')).val();

            var collectionDate = ($(event.target).find('input[name=collectionDate]')).val();

            var samplePeriod = ($(event.target).find('input[name=samplePeriod]')).val();

            var miteCount = ($(event.target).find('input[name=miteCount]')).val();

            //if not empty then insert
            if (hiveID.length > 0 && collectionDate.length > 0 && samplePeriod.length > 0 && miteCount.length > 0) {

                BeeData.insert(
                    {
                        hiveID: hiveID,
                        collectionDate: collectionDate,
                        samplePeriod: samplePeriod,
                        miteCount: miteCount,
                        createdOn: Date.now()
                    }
                );

                //var route = '/hive/'.concat(hiveID)
                Router.go('/hive/' + hiveID);
            }
            else {
                alert("All fields are required.")
            }
        }

    });


}

/*
 the code the meteor server will run
 */
if (Meteor.isServer) {

    Meteor.publish("beeData", function () {
        return BeeData.find();
    });
}
