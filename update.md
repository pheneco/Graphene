*[Graphene has updated to w0.4.3-s0.4.0](http://gra.phene.co)*


At this point updating is nearly seamless, and since I've said that will likely completely fail next time.
This update focuses on connectivity between users.
Tagging users with an at symbol (@) has been added, the tagged user will then recieve a notification.
Posts tagged with a user will show up on their user page as well as homepage, these actively load just as well as any other post.
Searching has been implemented, available at all times to the right of the main content; just type in a query and press enter.
For anyone interested in what can and can not be parsed in this query see the [MongoDB documentation on it](https://docs.mongodb.org/manual/reference/operator/query/text/).


There were also significant changes to the GUI as well.
Selected text is highlighted in the user's accent color now.
The sidebar has been reorganized to be easier to understand.
Notifications now load automatically, showing up to the right of the main content at all times.
These columns have also been fixed so that they no longer become inaccessible when the browser window is thinner than the content.
Hovercards no longer show extra links, and the follow button is now more obvious.


A bio field has been added to user pages.
This shows up on hovercards and in the search (it is indexed for search as well, though with a very light weighting).
To edit your bio, just click on it on your user page, type your desired text, and press enter to save.
This field is plain text only, no MarkDown for the time being.


Report bugs and review the source code on [GitHub](https://github.com/Trewbot/Graphene).


See the [changelog](http://gra.phene.co/changes) for more details.