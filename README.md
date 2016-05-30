# Funk Force 5 Website
## Setup
### Install ruby with with nvm

* Install rvm:

```
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --ruby
```

* Install ruby:

```
rvm install 2.2
rvm list
rvm use 2.2
```

* Setup in this directory:

```
gem install bundler
bundle install 
```

* Setup a JavaScript runtime

```
gem install execjs
