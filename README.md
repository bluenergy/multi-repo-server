# Multi Repo Deploy SYSTEM

## Background
We are using the practice of seperating front-end & back-end service. So it is diffcult for our QA testing different features in branchs. We noticed that we need a way to deploy different branches of front-end server and the same time they are pointing to the same back-end server.
And this project aims to deploy our front-end files under different branches to one front static http server and make our QA be able to test different features in the same env.
We call this project - **FENG Mulit Repot Deployment System**.

## How to use

- Step 1
`git clone https://github.com/fnjoe/multi-repo-server`

- Step 2
`$> cd multi-repo-server`
`$> npm install --registry=https://registry.npm.taobao.org`

- Step 3
`$> npm run start`


## Features
1. Multi project support
   * add projec
   * add user/pass for retrieving project 
2. Select branches
   * display all branches of a project
   * select one branch and deploy
   
3. Deploy
   * deploy project to server using selected project and branch
   * display url once the deployment is successfully finished
   
4. Proxy api request
   * proxy front-end api request to back-end server
   * be able to configure api request address
   
## How to comtribute
Please contact @Qiao.feng




