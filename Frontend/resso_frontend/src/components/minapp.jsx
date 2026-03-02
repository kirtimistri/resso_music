import React from 'react'
import { BrowserRouter, Routes,Route } from 'react-router-dom'
import Profile from './Profile'
import Songlist from './Songlist'
import Adminsonguplod from './SongUpload'
function minapp() {
  return (
    <BrowserRouter>
    <Routes>
       <Route  path="Profile" element={<Profile/>}/> 
        <Route path="Adminsonguplod" element={<Adminsonguplod/>}/>
        <Route index element={<Songlist/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default minapp
