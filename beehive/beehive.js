BeeData = new Mongo.Collection("beeData");

if (Meteor.isClient) {

    //current website subscribes to the beeData collection of the Mongo database
    Meteor.subscribe("beeData");

    //a function that orders all the data submitted
    Template.dataTable.helpers({
            "beeData": function () {
                return BeeData.find({}, {sort: {createdOn: -1}}) || {};
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
            if (hiveID.length > 0) {

                BeeData.insert(
                    {
                        hiveID: hiveID,
                        collectionDate: collectionDate,
                        samplePeriod: samplePeriod,
                        miteCount: miteCount,
                        createdOn: Date.now()
                    }
                );
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
