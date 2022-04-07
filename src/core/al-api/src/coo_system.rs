use cgmath::Matrix4;
pub trait CooBaseFloat: Sized + 'static {
    const GALACTIC_TO_J2000: &'static Matrix4<Self>;
    const J2000_TO_GALACTIC: &'static Matrix4<Self>;
    const ID: &'static Matrix4<Self>;
}

impl CooBaseFloat for f32 {
    const GALACTIC_TO_J2000: &'static Matrix4<Self> = &Matrix4::new(
        -0.444_829_64,
        0.746_982_2,
        0.494_109_42,
        0.0,
        -0.198_076_37,
        0.455_983_8,
        -0.867_666_1,
        0.0,
        -0.873_437_1,
        -0.483_835,
        -0.054_875_56,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    const J2000_TO_GALACTIC: &'static Matrix4<Self> = &Matrix4::new(
        -0.444_829_64,
        -0.198_076_37,
        -0.873_437_1,
        0.0,
        0.746_982_2,
        0.455_983_8,
        -0.483_835,
        0.0,
        0.494_109_42,
        -0.867_666_1,
        -0.054_875_56,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    const ID: &'static Matrix4<Self> = &Matrix4::new(
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );
}
impl CooBaseFloat for f64 {
    const GALACTIC_TO_J2000: &'static Matrix4<Self> = &Matrix4::new(
        -0.4448296299195045,
        0.7469822444763707,
        0.4941094279435681,
        0.0,
        -0.1980763734646737,
        0.4559837762325372,
        -0.867_666_148_981_161,
        0.0,
        -0.873437090247923,
        -0.4838350155267381,
        -0.0548755604024359,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    const J2000_TO_GALACTIC: &'static Matrix4<Self> = &Matrix4::new(
        -0.4448296299195045,
        -0.1980763734646737,
        -0.873437090247923,
        0.0,
        0.7469822444763707,
        0.4559837762325372,
        -0.4838350155267381,
        0.0,
        0.4941094279435681,
        -0.867_666_148_981_161,
        -0.0548755604024359,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    const ID: &'static Matrix4<Self> = &Matrix4::new(
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );}

use cgmath::BaseFloat;
use wasm_bindgen::prelude::*;
use serde::Deserialize;
#[wasm_bindgen]
#[derive(Clone, Copy, PartialEq, Eq)]
#[derive(Debug)]
#[derive(Deserialize)]
pub enum CooSystem {
    ICRSJ2000,
    GAL,
}

impl CooSystem {
    #[inline]
    pub fn to<S>(&self, coo_system: &Self) -> &Matrix4<S>
    where
        S: BaseFloat + CooBaseFloat,
    {
        match (self, coo_system) {
            (CooSystem::GAL, CooSystem::ICRSJ2000) => {
                S::GALACTIC_TO_J2000
            },
            (CooSystem::ICRSJ2000, CooSystem::GAL) => {
                S::J2000_TO_GALACTIC
            },
            (_, _) => S::ID
        }
    }
}

mod tests {
    #[allow(unused_macros)]
    macro_rules! assert_delta {
        ($x:expr, $y:expr, $d:expr) => {
            if !($x - $y < $d || $y - $x < $d) {
                panic!();
            }
        };
    }

    #[test]
    fn j2000_to_gal() {
        use crate::{ArcDeg, LonLatT};
        let lonlat = LonLatT::new(ArcDeg(0.0).into(), ArcDeg(0.0).into());
        let gal_lonlat = super::to_galactic(lonlat);

        let gal_lon_deg = gal_lonlat.lon().0 * 360.0 / (2.0 * std::f64::consts::PI);
        let gal_lat_deg = gal_lonlat.lat().0 * 360.0 / (2.0 * std::f64::consts::PI);

        assert_delta!(gal_lon_deg, 96.33723581, 1e-3);
        assert_delta!(gal_lat_deg, -60.18845577, 1e-3);
    }

    #[test]
    fn gal_to_j2000() {
        use crate::{ArcDeg, LonLatT};

        let lonlat = LonLatT::new(ArcDeg(0.0).into(), ArcDeg(0.0).into());
        let j2000_lonlat = super::to_icrs_j2000(lonlat);
        let j2000_lon_deg = j2000_lonlat.lon().0 * 360.0 / (2.0 * std::f64::consts::PI);
        let j2000_lat_deg = j2000_lonlat.lat().0 * 360.0 / (2.0 * std::f64::consts::PI);

        assert_delta!(j2000_lon_deg, 266.40506655, 1e-3);
        assert_delta!(j2000_lat_deg, -28.93616241, 1e-3);
    }

    #[test]
    fn j2000_gal_roundtrip() {
        use crate::{ArcDeg, LonLatT};
        let gal_lonlat = LonLatT::new(ArcDeg(0.0).into(), ArcDeg(0.0).into());

        let gal_lonlat = super::to_galactic(super::to_icrs_j2000(gal_lonlat));

        let gal_lon_deg = gal_lonlat.lon().0 * 360.0 / (2.0 * std::f64::consts::PI);
        let gal_lat_deg = gal_lonlat.lat().0 * 360.0 / (2.0 * std::f64::consts::PI);

        assert_delta!(gal_lon_deg, 0.0, 1e-3);
        assert_delta!(gal_lat_deg, 0.0, 1e-3);
    }
}
