BeeData = new Mongo.Collection("beeData");

Router.route('/', function () {
    this.render('form');
    this.layout('layout');
});

Router.route('/admin', function () {
    this.render('allData');
    this.layout('layout');
});

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

if (Meteor.isServer) {

    Meteor.publish("beeData", function () {
        return BeeData.find();
    });
}
